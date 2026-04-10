import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IBirthdayService } from '../services/BirthdayService';
import { IConfigService } from '../services/ConfigService';
import { ICardTemplateService } from '../services/CardTemplateService';
import { IGreetingService } from '../services/GreetingService';

/**
 * Props passed from BirthdaySliderWebPart.ts to the root React component.
 *
 * Services are injected from the WebPart class so they can be swapped
 * between real implementations and mocks without touching component code.
 */
export interface IBirthdaySliderProps {
  // SharePoint context and site info
  siteUrl: string;
  context: WebPartContext;
  isDarkTheme: boolean;

  // List name configuration (from property pane)
  listName: string;
  configListName: string;
  cardListName: string;
  auditListName: string;
  logListName: string;

  // Injected services
  birthdayService: IBirthdayService;
  configService: IConfigService;
  cardTemplateService: ICardTemplateService;
  greetingService: IGreetingService;
}
