// eslint-disable-next-line @typescript-eslint/ban-types
export interface CustomResponse<T = {}> {
	data: T;
	meta: {
		message?: string;
		statusCode?: number;
		page?: number | string;
		perPage?: number | string;
		totalPage?: number | string;
		totalData?: number | string;
		isEmailChanged?: boolean;
		isPhoneNumberChanged?: boolean;
	};
}

export class OkResponse<T> implements CustomResponse<T> {
	meta: {
		message: string;
		statusCode: number;
		page?: number | string;
		perPage?: number | string;
		totalPage?: number | string;
		totalData?: number | string;
	};
	data: T;
	constructor(data: T, meta?: CustomResponse<T>["meta"], statusCode?: number) {
		this.data = data;
		if (Array.isArray(data)) {
			this.meta = {
				...meta,
				message:
					(meta && meta.message) || "Data successfully retrieved/transmitted!",
				statusCode: 200,
				totalData: (meta && meta.totalData) || 0,
				page: (meta && Number(meta.page)) || 1,
				perPage: (meta && Number(meta.perPage)) || 10,
				totalPage: Math.ceil(
					((meta && Number(meta.totalData)) || 1) /
						(meta && meta.perPage ? Number(meta.perPage) : 10),
				),
			};
		} else {
			this.meta = {
				...meta,
				message:
					(meta && meta.message) || "Data successfully retrieved/transmitted!",
				statusCode: statusCode || 200,
			};
		}
	}
}

export class CreateDataResponse<T> implements CustomResponse<T> {
	meta: {
		message?: string;
		statusCode?: number;
	} = {};
	data: T;
	constructor(data: T, meta?: CustomResponse<T>["meta"], statusCode?: number) {
		this.data = data;
		this.meta = {
			...meta,
			message: (meta && meta.message) || "Data successfully created!",
			statusCode: statusCode || 201,
		};
	}
}

export class UpdateDataResponse<T> implements CustomResponse<T> {
	meta: {
		message: string;
		statusCode: number;
	};
	data: T;
	constructor(data: T, meta?: CustomResponse<T>["meta"], statusCode?: number) {
		this.data = data;

		this.meta = {
			...meta,
			message: (meta && meta.message) || "Data successfully updated!",
			statusCode: statusCode || 200,
		};
	}
}

export class DeleteDataResponse<T> implements CustomResponse<T> {
	meta: {
		message: string;
		statusCode?: number;
		page?: number | string;
		perPage?: number | string;
		totalPage?: number | string;
		totalData?: number | string;
	};
	data: T;
	constructor(data: T, meta?: CustomResponse<T>["meta"], statusCode?: number) {
		this.data = data;
		this.meta = {
			...meta,
			message: (meta && meta.message) || "Data successfully deleted!",
			statusCode: statusCode || 200,
		};
	}
}
