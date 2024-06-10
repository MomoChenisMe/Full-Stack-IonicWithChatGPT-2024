import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';
import { ConfirmAlertOptions } from '../models/alert.model';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private alertCtrl: AlertController) {}

  async deleteConfirm(opts: ConfirmAlertOptions) {
    const alert = await this.alertCtrl.create({
      message: opts.message,
      backdropDismiss: false,
      buttons: [
        {
          text: opts.cancelText ?? '取消',
          role: 'cancel',
          handler: opts.cancelHandler,
        },
        {
          text: opts.cancelText ?? '刪除',
          role: 'confirm',
          cssClass: 'alert-delete-button-color',
          handler: opts.confirmHandler,
        },
      ],
    });
    alert.present();
  }
}
