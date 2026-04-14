import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'BirthdayAllWebPartStrings';
import BirthdayAll from './components/BirthdayAll';
import { IBirthdayAllProps } from './components/IBirthdayAllProps';
import { SharePointRepository } from '../birthdaySlider/repositories/SharePointRepository';
import {
  BirthdayService,
  MockBirthdayService,
  IBirthdayService
} from '../birthdaySlider/services/BirthdayService';
import {
  ConfigService,
  MockConfigService,
  IConfigService
} from '../birthdaySlider/services/ConfigService';

const USE_REAL_DATA = true;

export interface IBirthdayAllWebPartProps {
  siteUrl: string;
  listName: string;
  configListName: string;
  logListName: string;
}

export default class BirthdayAllWebPart extends BaseClientSideWebPart<IBirthdayAllWebPartProps> {
  private _isDarkTheme = false;
  private _birthdayService: IBirthdayService;
  private _configService: IConfigService;

  protected onInit(): Promise<void> {
    this._initServices();
    return super.onInit();
  }

  private _initServices(): void {
    const resolvedSiteUrl = this.properties.siteUrl || this.context.pageContext.web.absoluteUrl;

    if (USE_REAL_DATA) {
      const repository = new SharePointRepository(this.context, resolvedSiteUrl);
      this._birthdayService = new BirthdayService(repository, this.properties.listName || 'Colaborador');
      this._configService = new ConfigService(
        repository,
        this.properties.configListName || 'Configuracion',
        resolvedSiteUrl
      );
      return;
    }

    this._birthdayService = new MockBirthdayService();
    this._configService = new MockConfigService(resolvedSiteUrl);
  }

  public render(): void {
    const element: React.ReactElement<IBirthdayAllProps> = React.createElement(BirthdayAll, {
      siteUrl: this.properties.siteUrl || this.context.pageContext.web.absoluteUrl,
      context: this.context,
      isDarkTheme: this._isDarkTheme,
      listName: this.properties.listName || 'Colaborador',
      configListName: this.properties.configListName || 'Configuracion',
      logListName: this.properties.logListName || 'Log',
      birthdayService: this._birthdayService,
      configService: this._configService
    });

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('siteUrl', {
                  label: 'URL del sitio (vacio = sitio actual)',
                  placeholder: 'https://tenant.sharepoint.com/sites/intranet'
                }),
                PropertyPaneTextField('listName', {
                  label: 'Lista de colaboradores',
                  value: 'Colaborador'
                }),
                PropertyPaneTextField('configListName', {
                  label: 'Lista de configuracion',
                  value: 'Configuracion'
                }),
                PropertyPaneTextField('logListName', {
                  label: 'Lista de log',
                  value: 'Log'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
