import {Component, OnInit, Input} from '@angular/core';
import {CurrencyService} from 'src/app/core/services/currency.service';
import {OfflineService} from 'src/app/core/services/offline.service';
import {filter, map, switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {Expense} from '../../../core/models/expense.model';


@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
})
export class CurrencyComponent implements OnInit {

  @Input() options: any;
  @Input() etxn: Expense;

  showExchangeRate$: Observable<boolean>;
  calculatedExchangeRate$: Observable<number>;
  amountConvertedToHomeCurrency$: Observable<number>;
  homeCurrency$: Observable<string>;

  constructor(
    private currencyService: CurrencyService,
    private offlineService: OfflineService
  ) {
  }

  ngOnInit() {
    this.homeCurrency$ = this.offlineService.getHomeCurrency();

    this.showExchangeRate$ = this.homeCurrency$.pipe(
      map(homeCurrency => {
        if (this.etxn.tx_orig_currency) {
          return this.etxn.tx_orig_currency !== homeCurrency;
        }

        return this.etxn.tx_currency !== homeCurrency;
      })
    );

    this.calculatedExchangeRate$ = this.homeCurrency$.pipe(
      switchMap(homeCurrency => {
        if (this.etxn.tx_orig_amount) {
          if (this.etxn.tx_currency === homeCurrency) {
            return of(this.etxn.tx_amount / this.etxn.tx_orig_amount);
          } else {
            return this.currencyService.getExchangeRate(this.etxn.tx_orig_currency, homeCurrency, this.etxn.tx_txn_dt);
          }
        } else {
          return this.currencyService.getExchangeRate(this.etxn.tx_currency, homeCurrency, this.etxn.tx_txn_dt);
        }
      })
    );

    this.amountConvertedToHomeCurrency$ = this.calculatedExchangeRate$.pipe(
      map(
        (calculatedExchangeRate: number) => {
          if (this.etxn.tx_orig_amount) {
            return this.etxn.tx_orig_amount * calculatedExchangeRate;
          } else {
            return this.etxn.tx_amount * calculatedExchangeRate;
          }
        }
      )
    );
  }

}
