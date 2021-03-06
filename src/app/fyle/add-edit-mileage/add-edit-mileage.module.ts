import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddEditMileagePageRoutingModule } from './add-edit-mileage-routing.module';

import { AddEditMileagePage } from './add-edit-mileage.page';

import { SharedModule } from 'src/app/shared/shared.module';

import { FySelectVehicleComponent } from './fy-select-vehicle/fy-select-vehicle.component';

import { FySelectProjectComponent } from './fy-select-project/fy-select-project.component';

import { FySelectModalComponent } from './fy-select-project/fy-select-modal/fy-select-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PolicyViolationComponent } from './policy-violation/policy-violation.component';
import { CriticalPolicyViolationComponent } from './critical-policy-violation/critical-policy-violation.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddEditMileagePageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  declarations: [
    AddEditMileagePage,
    FySelectVehicleComponent,
    FySelectProjectComponent,
    FySelectModalComponent,
    CriticalPolicyViolationComponent,
    PolicyViolationComponent
  ]
})
export class AddEditMileagePageModule { }
