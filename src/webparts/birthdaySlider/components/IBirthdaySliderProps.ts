import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IBirthdayService } from '../services/BirthdayService';
import { IConfigService } from '../services/ConfigService';
import { ICardTemplateService } from '../services/CardTemplateService';
import { IGreetingService } from '../services/GreetingService';

export interface IBirthdaySliderProps {
  siteUrl: string;
  context: WebPartContext;
  isDarkTheme: boolean;
  listName: string;
  configListName: string;
  cardListName: string;
  auditListName: string;
  logListName: string;
  birthdayService: IBirthdayService;
  configService: IConfigService;
  cardTemplateService: ICardTemplateService;
  greetingService: IGreetingService;
}
