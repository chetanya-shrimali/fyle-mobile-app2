import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, IonContent } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { Expense } from 'src/app/core/models/expense.model';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { TransactionService } from 'src/app/core/services/transaction.service';

@Component({
  selector: 'app-my-view-mileage',
  templateUrl: './my-view-mileage.page.html',
  styleUrls: ['./my-view-mileage.page.scss'],
})
export class MyViewMileagePage implements OnInit {

  @ViewChild('comments') commentsContainer: ElementRef;

  extendedMileage$: Observable<Expense>;
  orgSettings$: Observable<any>;
  mileageCustomFields$: Observable<CustomField[]>;
  isCriticalPolicyViolated$: Observable<boolean>;
  isAmountCapped$: Observable<boolean>;
  policyViloations$: Observable<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private transactionService: TransactionService,
    private offlineService : OfflineService,
    private customInputsService: CustomInputsService,
    private policyService: PolicyService,
    private navController: NavController
  ) { }

  isNumber(val) {
    return typeof val === 'number';
  }

  goBack() {
    this.navController.back();
  }

  scrollCommentsIntoView() {
    if (this.commentsContainer) {
      const commentsContainer = this.commentsContainer.nativeElement as HTMLElement;
      if (commentsContainer) {
        commentsContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      }
    }
  }

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;

    this.extendedMileage$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.transactionService.getExpenseV2(id);
      }),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.orgSettings$ = this.offlineService.getOrgSettings().pipe(
      shareReplay(1)
    );

    this.mileageCustomFields$ = this.extendedMileage$.pipe(
      tap(res => console.log('\n\n\n 1 ->', res)),
      switchMap(res => {
        return this.customInputsService.fillCustomProperties(res.tx_org_category_id, res.tx_custom_properties, true);
      }),
      tap(res => console.log('\n\n\n 2 ->', res)),
      map(res => {
        return res.map(customProperties => {
          customProperties.displayValue = this.customInputsService.getCustomPropertyDisplayValue(customProperties);
          return customProperties;
        });
      }),
      tap(res => console.log('\n\n\n 3 ->', res))
    );

    this.policyViloations$ = this.policyService.getPolicyRuleViolationsAndQueryParams(id);

    this.isCriticalPolicyViolated$ = this.extendedMileage$.pipe(
      map(res => {
        return this.isNumber(res.tx_policy_amount) && res.tx_policy_amount < 0.0001;
      })
    );

    this.isAmountCapped$ = this.extendedMileage$.pipe(
      map(res => {
        return this.isNumber(res.tx_admin_amount) || this.isNumber(res.tx_policy_amount);
      })
    );

  }


  ngOnInit() {
  }

}
