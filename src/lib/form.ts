import BigNumber from "bignumber.js";
import { camelCase } from "es-toolkit";

export type ValidationRule = {
	validate: (value: any) => boolean;
	message: string;
};

export const createRules = (rules: ValidationRule[]) => {
	const validate: Record<string, (value: any) => boolean | string> = {};

	for (const rule of rules) {
		validate[camelCase(rule.message)] = (value: any) =>
			rule.validate(value) || rule.message;
	}
	return { validate };
};

export const rules = {
	required: (message: string) => {
		return { validate: (value: any) => value !== "", message };
	},
	min: (min: string | number | BigNumber, message: string) => {
		return {
			validate: (value: any) => {
				if (!value) return true;
				return BigNumber(value).gte(min);
			},
			message,
		};
	},
	max: (max: string | number | BigNumber, message: string) => {
		return {
			validate: (value: any) => {
				if (!value) return true;
				return BigNumber(value).lte(max);
			},
			message,
		};
	},
	integer: (message: string) => {
		return { validate: (value: any) => BigNumber(value).isInteger(), message };
	},
	greaterThan: (min: number | BigNumber, message: string) => {
		return {
			validate: (value: any) => {
				if (!value) return true;
				return BigNumber(value).gt(min);
			},
			message,
		};
	},
	lessThan: (max: number | BigNumber, message: string) => {
		return {
			validate: (value: any) => {
				if (!value) return true;
				return BigNumber(value).lt(max);
			},
			message,
		};
	},
	inRange: (
		min: number | BigNumber,
		max: number | BigNumber,
		message: string,
	) => {
		return {
			validate: (value: any) => {
				if (!value) return true;
				return BigNumber(value).gte(min) && BigNumber(value).lte(max);
			},
			message,
		};
	},
	custom: (validate: (value: any) => boolean, message: string) => {
		return { validate, message };
	},
};
