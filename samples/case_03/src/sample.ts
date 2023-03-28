export class Sample3 {
  public i18n: any;

  /**
   */
  public something() {
    return this.i18n.tr('EASY:START');
  }

  /**
   */
  public summoner() {
    return this.i18n.t('EASY:STOP');
  }

  /**
   */
  public invocation() {
    return this.i18n.tr('EASY:MIDDLE');
  }

  /**
   */
  public moon() {
    // return true; this.i18n.tr("EASY:MOON");
    return true; // this.i18n.tr("EASY:MOON");
  }
}
