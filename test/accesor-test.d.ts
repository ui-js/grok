/**
 * Getter/Setter (accessor)
 */
declare class AccessorClass {
  private _bar: boolean;
  /**
   * Comment for getter
   * Full name:      {@link (AccessorClass:class).(bar:instance)}
   */
  get bar(): boolean;
  /**
   * Comment for setter is ignored
   */
  set bar(value: boolean);
}

/*
 * Setter only
 */
declare class SetterClass {
  private _bar: boolean;
  /**
   * Comment for setter is read
   */
  set bar(value: boolean);
}

/*
 * Getter only
 */
declare class GetterClass {
  constructor();
  private _bar: boolean;
  /**
   * Comment for getter
   * Note intentionally confusing name "constructor"
   * Links should point to the correct entry.
   * Note: typedoc currently doesn't parse this correctly
   */
  get xconstructor(): boolean;
}
