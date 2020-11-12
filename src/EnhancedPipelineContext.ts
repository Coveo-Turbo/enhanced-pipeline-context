import {
  Component,
  IComponentBindings,
  ComponentOptions,
} from "coveo-search-ui";
import { lazyComponent } from "@coveops/turbo-core";

export interface IEnhancedPipelineContextOptions {
  context: any;
}

@lazyComponent
export class EnhancedPipelineContext extends Component {
  static ID = "EnhancedPipelineContext";
  static options: IEnhancedPipelineContextOptions = {
    context: ComponentOptions.buildJsonObjectOption(),
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
}
