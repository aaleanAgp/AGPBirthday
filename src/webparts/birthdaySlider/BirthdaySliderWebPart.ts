import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'BirthdaySliderWebPartStrings';

import BirthdaySlider from './components/BirthdaySlider';
import { IBirthdaySliderProps } from './components/IBirthdaySliderProps';

import { SharePointRepository } from './repositories/SharePointRepository';
import { MockLoggerRepository } from './repositories/LoggerRepository';

import { MockGraphMailClient, GraphMailClient } from './graph/GraphMailClient';

import {
  BirthdayService,
  MockBirthdayService,
  IBirthdayService
} from './services/BirthdayService';
import {
  ConfigService,
  MockConfigService,
  IConfigService
} from './services/ConfigService';
import {
  CardTemplateService,
  MockCardTemplateService,
  ICardTemplateService
} from './services/CardTemplateService';
import { GreetingService, IGreetingService } from './services/GreetingService';
import { AuditService, MockAuditService } from './services/AuditService';

const USE_REAL_DATA = true;

export interface IBirthdaySliderWebPartProps {
  siteUrl: string;
  listName: string;
  configListName: string;
  cardListName: string;
  auditListName: string;
  logListName: string;
}

export default class BirthdaySliderWebPart extends BaseClientSideWebPart<IBirthdaySliderWebPartProps> {
  private _isDarkTheme = false;

  private _birthdayService: IBirthdayService;
  private _configService: IConfigService;
  private _cardTemplateService: ICardTemplateService;
  private _greetingService: IGreetingService;

  protected onInit(): Promise<void> {
    this._initServices();
    return super.onInit();
  }

  private _initServices(): void {
    const resolvedSiteUrl =
      this.properties.siteUrl ||
      (this.context.pageContext ? this.context.pageContext.web.absoluteUrl : '');

    if (USE_REAL_DATA) {
      const spRepo = new SharePointRepository(this.context, resolvedSiteUrl);
      const logger = new MockLoggerRepository();

      const auditService = new AuditService(spRepo, this.properties.auditListName || 'Auditoria');
      const mailClient = new GraphMailClient(this.context);

      this._birthdayService = new BirthdayService(spRepo, this.properties.listName || 'Colaborador');
      this._configService   = new ConfigService(
        spRepo,
        this.properties.configListName || 'Configuracion',
        resolvedSiteUrl
      );
      this._cardTemplateService = new CardTemplateService(spRepo, this.properties.cardListName || 'Tarjeta');
      this._greetingService = new GreetingService(mailClient, auditService);

      void logger;
    } else {
      const auditService = new MockAuditService();
      const mailClient   = new MockGraphMailClient();

      this._birthdayService    = new MockBirthdayService();
      this._configService      = new MockConfigService(resolvedSiteUrl);
      this._cardTemplateService = new MockCardTemplateService();
      this._greetingService    = new GreetingService(mailClient, auditService);
    }
  }

  public render(): void {
    const element: React.ReactElement<IBirthdaySliderProps> = React.createElement(
      BirthdaySlider,
      {
        siteUrl: this.properties.siteUrl ||
          (this.context.pageContext ? this.context.pageContext.web.absoluteUrl : ''),
        context: this.context,
        isDarkTheme: this._isDarkTheme,
        listName:       this.properties.listName       || 'Colaborador',
        configListName: this.properties.configListName || 'Configuracion',
        cardListName:   this.properties.cardListName   || 'Tarjeta',
        auditListName:  this.properties.auditListName  || 'Auditoria',
        logListName:    this.properties.logListName    || 'Log',
        birthdayService:     this._birthdayService,
        configService:       this._configService,
        cardTemplateService: this._cardTemplateService,
        greetingService:     this._greetingService
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;
    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;
    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link',    semanticColors.link     || null);
    }
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
                  label: 'URL del sitio (vacío = sitio actual)',
                  placeholder: 'https://tenant.sharepoint.com/sites/intranet'
                }),
                PropertyPaneTextField('listName', {
                  label: 'Lista de colaboradores',
                  value: 'Colaborador'
                }),
                PropertyPaneTextField('configListName', {
                  label: 'Lista de configuración',
                  value: 'Configuracion'
                }),
                PropertyPaneTextField('cardListName', {
                  label: 'Lista de tarjetas de saludo',
                  value: 'Tarjeta'
                }),
                PropertyPaneTextField('auditListName', {
                  label: 'Lista de auditoría',
                  value: 'Auditoria'
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
