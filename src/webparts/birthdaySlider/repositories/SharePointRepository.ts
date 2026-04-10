import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

// Index signature removed: requiring [key: string]: unknown on T
// forces all typed interfaces to declare unknown values for every key,
// which breaks strict internal interfaces. The Id constraint is sufficient.
export interface IListItem {
  Id: number;
}

export interface ISharePointRepository {
  getListItems<T extends IListItem>(
    listName: string,
    select?: string[],
    filter?: string,
    orderBy?: string,
    top?: number
  ): Promise<T[]>;

  addListItem<T>(listName: string, item: Record<string, unknown>): Promise<T>;
}

/**
 * Thin wrapper around SPHttpClient for standard SharePoint REST API operations.
 * All list names are URL-encoded to support names with spaces or special characters.
 */
export class SharePointRepository implements ISharePointRepository {
  constructor(
    private readonly context: WebPartContext,
    private readonly siteUrl: string
  ) {}

  async getListItems<T extends IListItem>(
    listName: string,
    select?: string[],
    filter?: string,
    orderBy?: string,
    top?: number
  ): Promise<T[]> {
    const params: string[] = ['$top=5000'];

    if (select && select.length > 0) params.push(`$select=${select.join(',')}`);
    if (filter) params.push(`$filter=${filter}`);
    if (orderBy) params.push(`$orderby=${orderBy}`);
    if (top) params[0] = `$top=${top}`;

    const url = `${this.siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(listName)}')/items?${params.join('&')}`;

    const response: SPHttpClientResponse = await this.context.spHttpClient.get(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'odata-version': ''
        }
      }
    );

    if (!response.ok) {
      throw new Error(`[SharePointRepository] GET ${listName} failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return (data.value as T[]) || [];
  }

  async addListItem<T>(listName: string, item: Record<string, unknown>): Promise<T> {
    const url = `${this.siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(listName)}')/items`;

    const response: SPHttpClientResponse = await this.context.spHttpClient.post(
      url,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-type': 'application/json;odata=nometadata',
          'odata-version': ''
        },
        body: JSON.stringify(item)
      }
    );

    if (!response.ok) {
      throw new Error(`[SharePointRepository] POST to ${listName} failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  }
}
