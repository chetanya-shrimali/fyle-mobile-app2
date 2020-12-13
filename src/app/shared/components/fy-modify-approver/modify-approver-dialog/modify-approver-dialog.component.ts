import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable, from, noop} from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { switchMap, reduce, finalize, map, tap, mergeMap } from 'rxjs/operators';
import { ModifyApproverConfirmationPopoverComponent } from './modify-approver-confirmation-popover/modify-approver-confirmation-popover.component';
import { ReportService } from 'src/app/core/services/report.service';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-modify-approver-dialog',
  templateUrl: './modify-approver-dialog.component.html',
  styleUrls: ['./modify-approver-dialog.component.scss'],
})
export class ModifyApproverDialogComponent implements OnInit {

  @ViewChild('searchBar') searchBarRef: ElementRef;
  @Input() approverList;
  @Input() id;
  @Input() from;
  @Input() object;

  approverList$: Observable<any>;
  selectedApprovers: any[] = [];
  intialSelectedApprovers: any[] = [];
  equals: boolean = false;

  constructor(
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private reportService: ReportService
  ) { }

  closeApproverModal() {
    this.modalController.dismiss();
  }

  async saveUpdatedApproveList() {

    let reportApprovals: [];
    const selectedApprovers = this.selectedApprovers.filter(approver => this.intialSelectedApprovers.indexOf(approver) === -1);
    const removedApprovers = this.intialSelectedApprovers.filter(approver => this.selectedApprovers.indexOf(approver) === -1);
    this.reportService.getApproversByReportId(this.id).pipe(
      map(res => {
        reportApprovals = res.filter(eou => {
          return removedApprovers.some(removedApprover => {
            return removedApprover.ou.id === eou.approver_id && eou.state !== 'APPROVAL_DONE';
          });
        })
      })
    ).subscribe(noop);

    const saveApproverConfirmationPopover = await this.popoverController.create({
      component: ModifyApproverConfirmationPopoverComponent,
      componentProps: {
        selectedApprovers: selectedApprovers,
        removedApprovers: removedApprovers
      },
      cssClass: 'dialog-popover'
    });

    saveApproverConfirmationPopover.present();

    const { data } = await saveApproverConfirmationPopover.onWillDismiss();
    if (data && data.message) {
      
      const selectedApproversTemp = selectedApprovers.map(eou => ({eou, command: 'add'}));
      const reportApprovalsTemp = reportApprovals.map(eou => ({eou, command: 'remove'}));
      
      const changedOps = selectedApproversTemp.concat(reportApprovalsTemp);

      from(changedOps).pipe(
        mergeMap(res => {
          if (res.command === 'add') {
            return this.reportService.addApprover(this.id, res.eou.us.email, data.message);
          } else {
            return this.reportService.removeApprover(this.id, res.eou.id); 
          }
        }),
        reduce((acc, curr) => {
          return acc.concat(curr);
        }, []),
      ).subscribe(() => {
        this.modalController.dismiss({reload: true});
      });
    }
  }

  onSelectApprover(approver, event) {
    if (event.checked) {
      approver.checked = true;
      this.selectedApprovers.push(approver);
    }

    if (!event.checked) {
      approver.checked = false;
      const index = this.selectedApprovers.indexOf(approver);
      if (index > -1) {
        this.selectedApprovers.splice(index, 1);
      }
    }
    this.equals = this.checkDifference(this.intialSelectedApprovers, this.selectedApprovers);
  }

  checkDifference(intialSelectedApprovers, selectedApprovers) {
    return isEqual(intialSelectedApprovers, selectedApprovers);
  }

  ngOnInit() {

    // this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
    //   map((event: any) => event.srcElement.value),
    //   startWith(''),
    //   distinctUntilChanged(),
    //   map((searchText) => {
    //     const initial = [];

    //     if (this.nullOption) {
    //       initial.push({ label: 'None', value: null });
    //     }

    //     return initial.concat(this.options
    //       .filter(option => option.label.toLowerCase().includes(searchText.toLowerCase()))
    //       .map(option => {
    //         option.selected = isEqual(option.value, this.currentSelection);
    //         return option;
    //       }));
    //   }
    //   )
    // );

    this.approverList$ = from(this.loaderService.showLoader('Loading Approvers', 10000)).pipe(
      switchMap(() => {
        return this.orgUserService.getAllCompanyEouc();
      }),
      map(eouc => {
        return this.orgUserService.excludeByStatus(eouc, 'DISABLED');
      }),
      map(eouc => {
        return eouc.filter((approver) => {
          if (this.approverList.indexOf(approver.ou.id) > -1) {
            approver['checked'] = true;
            this.selectedApprovers.push(approver);
          } else {
            approver['checked'] = false;
          }
          return approver;
        });
      }),
      map(eouc => {
        eouc = eouc.filter(approver => !this.selectedApprovers.includes(approver));
        return this.selectedApprovers.concat(eouc);
      }),
      tap(() => {
        this.intialSelectedApprovers = [...this.selectedApprovers];
        this.equals = this.checkDifference(this.intialSelectedApprovers, this.selectedApprovers);
      }),
      finalize(() => {
        from(this.loaderService.hideLoader());
      })
    );
  }
}