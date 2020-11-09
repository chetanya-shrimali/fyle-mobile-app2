import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DateService } from './date.service';
import { map, switchMap, tap, concatMap, reduce } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { NetworkService } from './network.service';
import { from, Observable, range, concat } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { DataTransformService } from './data-transform.service';
import { AuthService } from './auth.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TimezoneService } from 'src/app/services/timezone.service';
import { UtilityService } from 'src/app/services/utility.service';
import { FileService } from 'src/app/services/file.service';
import { PolicyApiService } from './policy-api.service';



@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService,
    private apiV2Service: ApiV2Service,
    private dataTransformService: DataTransformService,
    private dateService: DateService,
    private authService: AuthService,
    private orgUserSettingsService: OrgUserSettingsService,
    private timezoneService: TimezoneService,
    private utilityService: UtilityService,
    private fileService: FileService,
    private policyApiService: PolicyApiService
  ) { }

  get(txnId) {
    return this.apiService.get('/transactions/' + txnId).pipe(
      map((transaction) => {
        return this.dateService.fixDates(transaction);
      })
    );
  }

  parseRaw(etxnsRaw) {
    const etxns = [];

    etxnsRaw.forEach(element => {
      const etxn = this.dataTransformService.unflatten(element);

      this.dateService.fixDates(etxn.tx);
      this.dateService.fixDates(etxn.rp);

      let categoryDisplayName = etxn.tx.org_category;
      if (etxn.tx.sub_category && etxn.tx.sub_category.toLowerCase() !== categoryDisplayName.toLowerCase()) {
        categoryDisplayName += ' / ' + etxn.tx.sub_category;
      }
      etxn.tx.categoryDisplayName = categoryDisplayName;
      etxns.push(etxn);
    });

    return etxns;
  }

  getCountBySource(etxns, source) {
    const lowerCaseSource = source.toLowerCase();
    let count = 0;

    etxns.forEach((etxn) => {
      if (etxn.tx_source && etxn.tx_source.toLowerCase().indexOf(lowerCaseSource) > -1) {
        count++;
      }
    });

    return count;
  }

  getUserTransactionParams(state: string) {
    const stateMap = {
      draft: {
        state: ['DRAFT']
      },
      all: {
        state: ['COMPLETE'],
        policy_amount: ['is:null', 'gt:0.0001']
      },
      flagged: {
        policy_flag: true,
        policy_amount: ['is:null', 'gt:0.0001']
      },
      critical: {
        policy_amount: ['lt:0.0001']
      },
      unreported: {
        state: ['COMPLETE', 'DRAFT']
      },
      recurrence: {
        source: ['RECURRENCE_WEBAPP']
      },
      needsReceipt: {
        tx_receipt_required: true
      }
    };

    return stateMap[state];
  }

  getPaginatedETxncStats(params) {
    return this.apiService.get('/etxns/stats', { params });
  }

  getPaginatedETxncCount(params) {
    return this.networkService.isOnline().pipe(
      switchMap(
        isOnline => {
          if (isOnline) {
            return this.apiService.get('/etxns/count', { params }).pipe(
              tap((res) => {
                this.storageService.set('etxncCount' + JSON.stringify(params), res);
              })
            );
          } else {
            return from(this.storageService.get('etxncCount' + JSON.stringify(params)));
          }
        }
      )
    );
  }

  getMyETxncCount(tx_org_user_id: string): Observable<{ count: number }> {
    return this.apiV2Service.get('/expenses', { params: { offset: 0, limit: 1, tx_org_user_id } }).pipe(
      map(
        res => res as { count: number }
      )
    );
  }

  getMyETxnc(params: { offset: number, limit: number, tx_org_user_id: string }) {
    return this.apiV2Service.get('/expenses', {
      params
    }).pipe(
      map(
        (etxns) => {
          return etxns.data;
        }
      )
    );
  }

  getETxnc(params: { offset: number, limit: number, params: any }) {
    return this.apiV2Service.get('/expenses', {
      ...params
    }).pipe(
      map(
        (etxns) => {
          return etxns.data;
        }
      )
    );
  }

  getETxnCount(params: any) {
    return this.apiV2Service.get('/expenses', { params }).pipe(
      map(
        res => res as { count: number }
      )
    );
  }

  getAllETxnc(params) {
    return this.getETxnCount(params).pipe(
      switchMap(res => {
        return range(0, res.count / 50);
      }),
      concatMap(page => {
        return this.getETxnc({ offset: 50 * page, limit: 50, params });
      }),
      reduce((acc, curr) => {
        return acc.concat(curr);
      })
    );
  }

  getAllMyETxnc() {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.getMyETxncCount('eq.' + eou.ou.id).pipe(
          switchMap(res => {
            return range(0, res.count / 50);
          }),
          concatMap(page => {
            return this.getMyETxnc({ offset: 50 * page, limit: 50, tx_org_user_id: 'eq.' + eou.ou.id });
          }),
          reduce((acc, curr) => {
            return acc.concat(curr);
          })
        );
      })
    );
  }

  getMyExpensesCount(queryParams = {}) {
    return this.getMyExpenses({
      offset: 0,
      limit: 1,
      queryParams
    }).pipe(
      map(res => res.count)
    );
  }

  getMyExpenses(config: Partial<{ offset: number, limit: number, order: string, queryParams: any }> = {
    offset: 0,
    limit: 10,
    queryParams: {}
  }) {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiV2Service.get('/expenses', {
          params: {
            offset: config.offset,
            limit: config.limit,
            order: `${config.order || 'tx_txn_dt.desc'},tx_id.desc`,
            tx_org_user_id: 'eq.' + eou.ou.id,
            ...config.queryParams
          }
        });
      }),
      map(res => res as {
        count: number,
        data: any[],
        limit: number,
        offset: number,
        url: string
      }),
      map(res => ({
        ...res,
        data: res.data.map(this.dateService.fixDates)
      }))
    );
  }

  getAllExpenses(config: Partial<{ order: string, queryParams: any }>) {
    return this.getMyExpensesCount(config.queryParams).pipe(
      switchMap(count => {
        return range(0, count / 50);
      }),
      concatMap(page => {
        return this.getMyExpenses({ offset: 50 * page, limit: 50, queryParams: config.queryParams, order: config.order });
      }),
      map(res => res.data),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }, [] as any[])
    );
  }

  getTransactionStats(aggregates: string, queryParams = {}) {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiV2Service.get('/expenses/stats', {
          params: {
            aggregates,
            tx_org_user_id: 'eq.' + eou.ou.id,
            ...queryParams
          }
        });
      }),
      map(res => res.data)
    );
  }

  delete(txnId: string) {
    return this.apiService.delete('/transactions/' + txnId);
  }

  upsert(transaction) {
    /** Only these fields will be of type text & custom fields */
    const fieldsToCheck = ['purpose', 'vendor', 'train_travel_class', 'bus_travel_class'];

    // Frontend should only send amount
    transaction.user_amount = null;
    transaction.admin_amount = null;
    transaction.policy_amount = null;

    // FYLE-6148. Don't send custom_attributes.
    transaction.custom_attributes = null;

    return this.orgUserSettingsService.get().pipe(
      switchMap((orgUserSettings) => {

        const offset = orgUserSettings.locale.offset;

        // setting txn_dt time to T10:00:00:000 in local time zone
        if (transaction.txn_dt) {
          transaction.txn_dt.setHours(12);
          transaction.txn_dt.setMinutes(0);
          transaction.txn_dt.setSeconds(0);
          transaction.txn_dt.setMilliseconds(0);
          transaction.txn_dt = this.timezoneService.convertToUtc(transaction.txn_dt, offset);
        }

        if (transaction.from_dt) {
          transaction.from_dt.setHours(12);
          transaction.from_dt.setMinutes(0);
          transaction.from_dt.setSeconds(0);
          transaction.from_dt.setMilliseconds(0);
          transaction.from_dt = this.timezoneService.convertToUtc(transaction.from_dt, offset);
        }

        if (transaction.to_dt) {
          transaction.to_dt.setHours(12);
          transaction.to_dt.setMinutes(0);
          transaction.to_dt.setSeconds(0);
          transaction.to_dt.setMilliseconds(0);
          transaction.to_dt = this.timezoneService.convertToUtc(transaction.to_dt, offset);
        }

        const transactionCopy = this.utilityService.discardRedundantCharacters(transaction, fieldsToCheck);

        return this.apiService.post('/transactions', transactionCopy);
      })
    );
  }

  createTxnWithFiles(txn, fileUploads$: Observable<any>) {
    console.log(arguments);
    return fileUploads$.pipe(
      tap(console.log),
      switchMap((fileObjs: any[]) => {
        console.log('inside createTxnWithFiles');
        console.log(fileObjs);
        return this.upsert(txn).pipe(
          switchMap(transaction => {
            return concat(fileObjs.map(fileObj => {
              fileObj.transaction_id = transaction.id;
              return this.fileService.post(fileObj);
            })).pipe(
              map(() => transaction)
            );
          })
        );
      })
    );
  }


  testPolicy(etxn) {
    return this.orgUserSettingsService.get().pipe(
      switchMap((orgUserSettings) => {
        // setting txn_dt time to T10:00:00:000 in local time zone
        if (etxn.tx_txn_dt) {
          etxn.tx_txn_dt.setHours(12);
          etxn.tx_txn_dt.setMinutes(0);
          etxn.tx_txn_dt.setSeconds(0);
          etxn.tx_txn_dt.setMilliseconds(0);
          etxn.tx_txn_dt = this.timezoneService.convertToUtc(etxn.tx_txn_dt, orgUserSettings.locale.offset);
        }

        if (etxn.tx_from_dt) {
          etxn.tx_from_dt.setHours(12);
          etxn.tx_from_dt.setMinutes(0);
          etxn.tx_from_dt.setSeconds(0);
          etxn.tx_from_dt.setMilliseconds(0);
          etxn.tx_from_dt = this.timezoneService.convertToUtc(etxn.tx_from_dt, orgUserSettings.locale.offset);
        }

        if (etxn.tx_to_dt) {
          etxn.tx_to_dt.setHours(12);
          etxn.tx_to_dt.setMinutes(0);
          etxn.tx_to_dt.setSeconds(0);
          etxn.tx_to_dt.setMilliseconds(0);
          etxn.tx_to_dt = this.timezoneService.convertToUtc(etxn.tx_to_dt, orgUserSettings.locale.offset);
        }

        // FYLE-6148. Don't send custom_attributes.
        etxn.tx_custom_attributes = null;

        return this.policyApiService.post('/policy/test', etxn);
      })
    );
  }

  getETxn(txnId) {
    return this.apiService.get('/etxns/' + txnId).pipe(
      map((data) =>{
        const etxn = this.dataTransformService.unflatten(data);
        this.dateService.fixDates(etxn.tx);

        // Adding a field categoryDisplayName in transaction object to save funciton calls
        let categoryDisplayName = etxn.tx.org_category;
        if (etxn.tx.sub_category && etxn.tx.sub_category.toLowerCase() !== categoryDisplayName.toLowerCase()) {
          categoryDisplayName += ' / ' + etxn.tx.sub_category;
        }
        etxn.tx.categoryDisplayName = categoryDisplayName;
        return etxn;
      })
    );
  }

  matchCCCExpense(txnId, corporateCreditCardExpenseId) {
    const data = {
      transaction_id: txnId,
      corporate_credit_card_expense_id: corporateCreditCardExpenseId
    };

    return this.apiService.post('/transactions/match', data);
  }
}
