import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { OptionsWithUri } from 'request-promise-native';

export class PagarMe implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
		displayName: 'Pagar.me',
		name: 'PagarMe',
		icon: 'file:pagarMe.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get data from Pagar.me API',
		defaults: {
			name: 'Pagar.me',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'pagarMeApi',
				required: true,
			},
		],
		/*  */
		properties: [
			// Resources and operations will go here
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create Order',
						value: 'createOrder',
					}
				],
				default: 'createOrder',
			},
			// Operations will go here
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['createOrder'],
					},
				},
				options: [
					{
						name: 'Post',
						value: 'post',
						action: 'Create new order',
						description: 'Create a new order',
					},
				],
				default: 'post',
			},
			{
				displayName: 'Customer Name', // The value the user sees in the UI
				name: 'name', // The name used to reference the element UI within the code
				type: 'string',
				required: true, // Whether the field is required or not
				default: '',
				description: 'The name of the customer',
				displayOptions: {
					// the resources and operations to display this element with
					show: {
						resource: [
							// comma-separated list of resource names
							'createOrder',
						],
						operation: [
							// comma-separated list of operation names
							'post',
						],
					},
				},
			},
			{
				displayName: 'Customer Email', // The value the user sees in the UI
				name: 'email', // The name used to reference the element UI within the code
				type: 'string',
				placeholder: 'name@email.com',
				required: true, // Whether the field is required or not
				default: '',
				description: 'The name of the customer',
				displayOptions: {
					// the resources and operations to display this element with
					show: {
						resource: [
							// comma-separated list of resource names
							'createOrder',
						],
						operation: [
							// comma-separated list of operation names
							'post',
						],
					},
				},
			},
			{
				displayName: 'Item Amount',
				name: 'amount',
				type: 'number',
				required: true,
				typeOptions: {
					maxValue: 999,
					minValue: 1,
					numberStepSize: 1,
				},
				default: 1,
				description: 'Item amout',
				displayOptions: { // the resources and operations to display this element with
					show: {
						resource: [
							// comma-separated list of resource names
							'createOrder',
						],
						operation: [
							// comma-separated list of operation names
							'post',
						]
					}
				},
			},
			{
				displayName: 'Item Code', // The value the user sees in the UI
				name: 'code', // The name used to reference the element UI within the code
				type: 'string',
				placeholder: '0000000',
				required: true, // Whether the field is required or not
				default: '',
				displayOptions: {
					// the resources and operations to display this element with
					show: {
						resource: [
							// comma-separated list of resource names
							'createOrder',
						],
						operation: [
							// comma-separated list of operation names
							'post',
						],
					},
				},
			},
			{
				displayName: 'Item Description', // The value the user sees in the UI
				name: 'description', // The name used to reference the element UI within the code
				type: 'string',
				placeholder: 'Item details',
				required: true, // Whether the field is required or not
				default: '',
				displayOptions: {
					// the resources and operations to display this element with
					show: {
						resource: [
							// comma-separated list of resource names
							'createOrder',
						],
						operation: [
							// comma-separated list of operation names
							'post',
						],
					},
				},
			}
		],
	};
		// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Handle data coming from previous nodes
		const items = this.getInputData();
		let responseData;
		const returnData = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// For each item, make an API call to create a contact
		for (let i = 0; i < items.length; i++) {
			if (resource === 'createOrder') {
				if (operation === 'post') {
					// Get email input
					const name = this.getNodeParameter('name', i) as string;
					const email = this.getNodeParameter('email', i) as string;
					const amount = this.getNodeParameter('amount', i) as number;
					const code = this.getNodeParameter('code', i) as string;
					const description = this.getNodeParameter('description', i) as string;

					// Make HTTP request according to https://sendgrid.com/docs/api-reference/
					const options: OptionsWithUri = {
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						method: 'POST',
						body: {
							customer: {
								name: name,
								email: email,
							},
							items: [
								{
									amount: amount,
									description: description,
									quantity: 1,
									code: code,
								},
							],
							payments: [
								{
									amount: amount,
									payment_method: 'checkout',
									checkout: {
										expires_in: 120,
										billing_address_editable: false,
										customer_editable: true,
										accepted_payment_methods: ['credit_card'],
										success_url: 'https://dias.agency/',
									},
								},
							]
						},
						uri: `https://api.pagar.me/core/v5/orders`,
						json: true,
					};
					console.log(options.body)
					responseData = await this.helpers.requestWithAuthentication.call(this, 'pagarMeApi', options);
					returnData.push(responseData);
				}
			}
		}
		// Map data to n8n data structure

		return [this.helpers.returnJsonArray(returnData)];

	}
}

