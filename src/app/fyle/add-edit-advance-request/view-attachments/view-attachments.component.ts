import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { noop, from, iif, of } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { switchMap, finalize } from 'rxjs/operators';
import { FileService } from 'src/app/core/services/file.service';
import { PopupService } from 'src/app/core/services/popup.service';
import {TrackingService} from '../../../core/services/tracking.service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-view-attachments',
  templateUrl: './view-attachments.component.html',
  styleUrls: ['./view-attachments.component.scss'],
})
export class ViewAttachmentsComponent implements OnInit {

  sliderOptions: any;
  @Input() attachments: any[];
  activeIndex = 0;

  @ViewChild('slides') imageSlides: any;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private loaderService: LoaderService,
    private fileService: FileService,
    private popupService: PopupService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.attachments.forEach(attachment => {
      if (attachment.type === 'pdf') {
        this.sanitizer.bypassSecurityTrustUrl(attachment.url);
      }
    });

    this.sliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };
  }

  onDoneClick() {
    this.modalController.dismiss({ attachments: this.attachments });
  }

  goToNextSlide() {
    this.imageSlides.slideNext();
  }

  goToPrevSlide() {
    this.imageSlides.slidePrev();
  }

  async deleteAttachment() {
    const activeIndex = await this.imageSlides.getActiveIndex();
    const popupResult = await this.popupService.showPopup({
      header: 'Confirm',
      message: 'Are you sure you want to delete this attachment?',
      primaryCta: {
        text: 'DELETE'
      }
    });

    if (popupResult === 'primary') {
      from(this.loaderService.showLoader()).pipe(
        switchMap(() => {
          if (this.attachments[activeIndex].id) {
            return this.fileService.delete(this.attachments[activeIndex].id);
          } else {
            return of(null);
          }
        }),
        finalize(() => from(this.loaderService.hideLoader()))
      ).subscribe(() => {
        this.attachments.splice(activeIndex, 1);
        if (this.attachments.length === 0) {
          this.modalController.dismiss({ attachments: this.attachments });
        } else {
          if (activeIndex > 0) {
            this.goToPrevSlide();
          } else {
            this.goToNextSlide();
          }
        }
      });
    }
  }
}
