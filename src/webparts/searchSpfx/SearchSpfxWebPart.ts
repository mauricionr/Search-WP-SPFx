import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
	BaseClientSideWebPart,
	IPropertyPaneSettings,
	IWebPartContext,
	PropertyPaneTextField,
	PropertyPaneDropdown,
	PropertyPaneSlider,
	PropertyPaneToggle
} from '@microsoft/sp-client-preview';

import ModuleLoader from '@microsoft/sp-module-loader';

import * as strings from 'mystrings';
import SearchSpfx, { ISearchSpfxProps } from './components/SearchSpfx';
import { ISearchSpfxWebPartProps } from './ISearchSpfxWebPartProps';
import { IExternalTemplate } from './utils/ITemplates';
import { allTemplates } from './templates/TemplateLoader';

// Expose React to window -> required for external template loading
require("expose?React!react");

export default class SearchSpfxWebPart extends BaseClientSideWebPart<ISearchSpfxWebPartProps> {
	public constructor(context: IWebPartContext) {
		super(context);
	}

	public render(): void {
		if (this.properties.external) {
			// Loading external template
			ModuleLoader.loadScript(this.properties.externalUrl, "externalTemplate").then((externalTemplate: IExternalTemplate): void => {
				// Rendering from the external template
				const element: React.ReactElement<ISearchSpfxProps> = React.createElement(SearchSpfx, {
					title: this.properties.title,
					query: this.properties.query,
					maxResults: this.properties.maxResults,
					sorting: this.properties.sorting,
					context: this.context,
					firstRender: this.renderedOnce,
					template: this.properties.template,
					externalTemplate: externalTemplate
				});

				ReactDom.render(element, this.domElement);
			}).catch((error) => {
				console.log('ERROR: ', error);
			});
		} else {
			// Render from internal template
			const element: React.ReactElement<ISearchSpfxProps> = React.createElement(SearchSpfx, {
				title: this.properties.title,
				query: this.properties.query,
				maxResults: this.properties.maxResults,
				sorting: this.properties.sorting,
				context: this.context,
				firstRender: this.renderedOnce,
				template: this.properties.template
			});

			ReactDom.render(element, this.domElement);
		}
	}

	protected get propertyPaneSettings(): IPropertyPaneSettings {
		let templateProperty: any = PropertyPaneDropdown('template', {
			label: strings.FieldsTemplateLabel,
			options: allTemplates
		});

		if (this.properties.external) {
			templateProperty = PropertyPaneTextField('externalUrl', {
				label: strings.FieldsExternalTempLabel
			});
		}

		return {
			pages: [{
				header: {
					description: strings.PropertyPaneDescription
				},
				groups: [{
					groupName: strings.BasicGroupName,
					groupFields: [
						PropertyPaneTextField('title', {
							label: strings.FieldsTitleLabel
						}),
						PropertyPaneTextField('query', {
							label: strings.QueryFieldLabel,
							description: strings.QueryInfoDescription,
							multiline: true
						}),
						PropertyPaneSlider('maxResults', {
							label: strings.FieldsMaxResults,
							min: 1,
							max: 50
						}),
						PropertyPaneTextField('sorting', {
							label: strings.FieldsSorting
						}),
						PropertyPaneToggle('external', {
							label: strings.FieldsExternalLabel
						}),
						templateProperty
					]
				}]
			}]
		};
	}

	// Prevent from changing the query on typing
	protected get disableReactivePropertyChanges(): boolean {
		return true;
	}
}