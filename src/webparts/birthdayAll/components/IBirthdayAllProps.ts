import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IBirthdayService } from '../../birthdaySlider/services/BirthdayService';
import { IConfigService } from '../../birthdaySlider/services/ConfigService';

export interface IBirthdayAllProps {
  siteUrl: string;
  context: WebPartContext;
  isDarkTheme: boolean;
  listName: string;
  configListName: string;
  logListName: string;
  birthdayService: IBirthdayService;
  configService: IConfigService;
}
