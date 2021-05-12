import {
  Component,
  IComponentBindings,
  ComponentOptions,
  IStringMap,
  IDoneBuildingQueryEventArgs,
  IChangeAnalyticsCustomDataEventArgs,
  PipelineContext
} from "coveo-search-ui";
import { lazyComponent } from "@coveops/turbo-core";

export interface IEnhancedPipelineContextOptions {
  context: IStringMap<any>;
  stripOutHtmlTagsFromContext: boolean;
  setCustomDataOnClickEvent: boolean;
  setCustomDataOnCustomEvent: boolean;
}

@lazyComponent
export class EnhancedPipelineContext extends Component {
  static ID = "EnhancedPipelineContext";
  static options: IEnhancedPipelineContextOptions = {
    context: ComponentOptions.buildJsonOption(),
    stripOutHtmlTagsFromContext: ComponentOptions.buildBooleanOption({defaultValue: true}),
    setCustomDataOnClickEvent: ComponentOptions.buildBooleanOption({ defaultValue: false }),
    setCustomDataOnCustomEvent: ComponentOptions.buildBooleanOption({ defaultValue: false })
  };

  private pipelineContext: PipelineContext;

  constructor(
    public element: HTMLElement,
    public options: IEnhancedPipelineContextOptions,
    public bindings?: IComponentBindings
  ) {
    super(element, EnhancedPipelineContext.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(element, EnhancedPipelineContext, options);

    this.loadComponents().then(()=>{
      this.pipelineContext = new Coveo['PipelineContext'](this.element, {}, bindings);
      this.setupPipelineContext(this.options.context);
    });

    this.bind.onRootElement(Coveo.InitializationEvents.afterComponentsInitialization, this.handleAfterComponentsInit);
    this.bind.onRootElement(Coveo.AnalyticsEvents.changeAnalyticsCustomData, this.handleChangeAnalyticsCustomData);

  }

  /**
   * After Components Init
   */
  private handleAfterComponentsInit() {
    this.bind.onRootElement(Coveo.QueryEvents.doneBuildingQuery, this.handleDoneBuildingQuery);
  }

  /**
   * Change Analytics Custom Data
   */
  private handleChangeAnalyticsCustomData(args: IChangeAnalyticsCustomDataEventArgs) {

    if ((this.options.setCustomDataOnClickEvent && args.type === 'ClickEvent') || (this.options.setCustomDataOnCustomEvent && args.type === 'CustomEvent')) {
      args.metaObject = this.merge(args.metaObject, this.getPipelineContext());
    }
  }

  private merge(dest: any, src: any) {
    for (var key in src) {
      dest['context_' + key] = src[key];
    }
    return dest;
  }

  /**
  * striping out html tags at Done Building query if option is enabled.
  */
  private handleDoneBuildingQuery(data: IDoneBuildingQueryEventArgs) {
    if(this.options.stripOutHtmlTagsFromContext){
      let context = data.queryBuilder.context;
      context = _.mapObject(context, (v:string, key) => { 
        return (_.unescape(v)).replace(/<[^>]+>/g, ''); 
      });
      data.queryBuilder.addContext(context);
    }
  }

  public setupPipelineContext(data: IStringMap<any>) {
    let context:any = _.extend({}, this.getPipelineContext(), _.pick(data, _.identity) || {});

    if(this.options.stripOutHtmlTagsFromContext){
      context = _.mapObject(context, (v:string, key) => { 
        return (_.unescape(v)).replace(/<[^>]+>/g, ''); 
      });
    }
    this.pipelineContext.setContext(context);
  }

  public getPipelineContext() {
    return this.searchInterface.getQueryContext();
  }

  private loadComponents(){
    return new Promise<void>((resolve)=>{
      Coveo.load('PipelineContext').then((PipelineContext) => {
        resolve();
      });
    }) 
  }


}
