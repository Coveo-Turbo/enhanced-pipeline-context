import {
  Component,
  IComponentBindings,
  ComponentOptions,
} from "coveo-search-ui";
import { lazyComponent } from "@coveops/turbo-core";

export interface IEnhancedPipelineContextOptions {
  context: any;
  setCustomDataOnClickEvent: boolean;
  setCustomDataOnCustomEvent: boolean;
}

@lazyComponent
export class EnhancedPipelineContext extends Component {
  static ID = "EnhancedPipelineContext";
  static options: IEnhancedPipelineContextOptions = {
    context: ComponentOptions.buildJsonOption(),
    setCustomDataOnClickEvent: Coveo.ComponentOptions.buildBooleanOption({ defaultValue: false }),
    setCustomDataOnCustomEvent: Coveo.ComponentOptions.buildBooleanOption({ defaultValue: false })
  };

  constructor(
    public element: HTMLElement,
    public options: IEnhancedPipelineContextOptions,
    public bindings?: IComponentBindings
  ) {
    super(element, EnhancedPipelineContext.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(
      element,
      EnhancedPipelineContext,
      options
    );

    this.bind.onRootElement(
      Coveo.InitializationEvents.afterComponentsInitialization,
      () => this.handleAfterComponentsInit()
    );

    this.bind.onRootElement(
      Coveo.AnalyticsEvents.changeAnalyticsCustomData,
      (args: Coveo.IChangeAnalyticsCustomDataEventArgs) => this.handleChangeAnalyticsCustomData(args)
    );

  }

  /**
   * After Components Init
   */
  private handleAfterComponentsInit() {
    let searchinterface = <Coveo.SearchInterface>(
      Coveo.get(this.root, "SearchInterface")
    );
    let pipelineContext: Coveo.PipelineContext = <Coveo.PipelineContext>(
      searchinterface.getComponents("PipelineContext")[0]
    );

    pipelineContext.setContext(this.options.context);
  }

  /**
   * Change Analytics Custom Data
   */
  private handleChangeAnalyticsCustomData(args: Coveo.IChangeAnalyticsCustomDataEventArgs) {

    if ((this.options.setCustomDataOnClickEvent && args.type === 'ClickEvent') || (this.options.setCustomDataOnCustomEvent && args.type === 'CustomEvent')) {
      if (args['resultData']) {
        args.metaObject = this.merge(args.metaObject, this.options.context);
      }
    }
  }

  private merge(dest: any, src: any) {
    for (var key in src) {
      dest['context_' + key] = src[key];
    }
    return dest;
  }

}
