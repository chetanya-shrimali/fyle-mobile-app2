
import { Component, OnInit } from '@angular/core';
import { forkJoin, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';

import { AuthService } from 'src/app/core/services/auth.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { OneClickActionService } from 'src/app/core/services/one-click-action.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import {ExtendedOrgUser} from '/Users/tarun/git/fyle-mobile-app2/src/app/core/models/extended-org-user.model';

import { SelectCurrencyComponent } from 'src/app/post-verification/setup-account/select-currency/select-currency.component';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage implements OnInit {
  eou: ExtendedOrgUser;
  orgUserSettings: any;
  expenses: any;
  toggleUsageDetailsTab: boolean;
  oneClickActionOptions: any[];
  oneClickActionSelectedModule: any;
  orgSettings: any;
  currencies: any;
  preferredCurrency: any;

  constructor(
    private authService: AuthService,
    private offlineService: OfflineService,
    private transactionService: TransactionService,
    private oneClickActionService: OneClickActionService,
    private currencyService: CurrencyService,
    private orgUserSettingsService: OrgUserSettingsService,
    private modalController: ModalController
  ) { }

  logOut() {
    console.log('will logout user later');
  }

  toggleUsageDetails() {
    this.toggleUsageDetailsTab = !this.toggleUsageDetailsTab;
  }

  setMyExpensesCountBySource(myETxnc) {
    this.expenses = {
      total: myETxnc.length,
      mobile: this.transactionService.getCountBySource(myETxnc, 'MOBILE'),
      extension: this.transactionService.getCountBySource(myETxnc, 'GMAIL'),
      outlook: this.transactionService.getCountBySource(myETxnc, 'OUTLOOK'),
      email: this.transactionService.getCountBySource(myETxnc, 'EMAIL'),
      web: this.transactionService.getCountBySource(myETxnc, 'WEBAPP')
    };
  }


  toggleCurrencySettings() {
    return this.orgUserSettingsService.post(this.orgUserSettings)
    .pipe(
      map((res) => {
        console.log(res);
      })
    )
    .subscribe();
  }

  async openCurrenySelectionModal(event) {
    console.log("?????????????")
    const modal = await this.modalController.create({
      component: SelectCurrencyComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      console.log(data);
      // this.fg.controls.homeCurrency.setValue(data.currency.shortCode);
    }
  }
  
  toggleAutoExtraction() {
    // console.log(this.orgUserSettings.insta_fyle_settings);
    return this.orgUserSettingsService.post(this.orgUserSettings)
    .pipe(
      map((res) => {
        console.log(res);
      })
    )
    .subscribe();

  }

  getOneClickActionSelectedModule(id: string) {
    this.oneClickActionSelectedModule = this.oneClickActionService.filterByOneClickActionById(id);
    console.log(this.oneClickActionSelectedModule)
  }

  oneClickActionModuleChanged() {
    // One click action module value changed
  }

  getAllCurrencyAndMatchPreferredCurrency() {
    this.currencyService.getAllCurrenciesInList().pipe(
      map((res) => {
        console.log(res);
        this.currencies = res;
        this.currencies.some((currency) => {
          if (this.orgUserSettings.currency_settings.preferred_currency === currency.id) {
            this.preferredCurrency = currency;
            console.log(this.preferredCurrency);
            return true;
          }
        });
      })
    ).subscribe();
  }

  ngOnInit() {
    const eou$ = this.authService.getEou();
    const orgUserSettings$ =  this.offlineService.getOrgUserSettings();
    const myETxnc$ = this.transactionService.getMyETxncInternal();
    const orgSettings$ = this.offlineService.getOrgSettings();

    orgUserSettings$.pipe(
      map((res) => {
        const oneClickAction = res.one_click_action_settings.allowed && res.one_click_action_settings.enabled && res.one_click_action_settings.module;
        if (oneClickAction) {
          this.getOneClickActionSelectedModule(oneClickAction);
        }
      })
    ).subscribe();

    const primaryData = forkJoin({
      eou: eou$,
      orgUserSettings: orgUserSettings$,
      myETxnc: myETxnc$,
      orgSettings: orgSettings$
    });

    primaryData.subscribe((res) => {
      this.eou = res.eou;
      this.orgUserSettings = res.orgUserSettings;
      const myETxnc = res.myETxnc;
      this.orgSettings = res.orgSettings;
      this.setMyExpensesCountBySource(myETxnc);
      this.oneClickActionOptions = this.oneClickActionService.getAllOneClickActionOptions();
      if (this.orgSettings.org_currency_settings.enabled) {
        this.getAllCurrencyAndMatchPreferredCurrency();
      }
    });

  }

}