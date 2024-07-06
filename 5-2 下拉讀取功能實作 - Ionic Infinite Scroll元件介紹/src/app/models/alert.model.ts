export interface ConfirmAlertOptions {
  message: string;
  cancelText?: string;
  confirmText?: string;
  confirmHandler?: (data: any) => void;
  cancelHandler?: (data: any) => void;
}
