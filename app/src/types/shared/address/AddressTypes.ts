export type AddressRegion = {
	id: number;
	name: string;
	psgcCode: string;
	regionCode: string;
};

export type AddressProvince = {
	id: number;
	name: string;
	provinceCode: string;
	psgcCode: string;
	regionCode: string;
};

export type AddressCityMunicipality = {
	cityMunicipalityCode: string;
	id: number;
	name: string;
	provinceCode: string;
	psgcCode: string;
	regionCode: string;
};

export type AddressBarangay = {
	barangayCode: string;
	cityMunicipalityCode: string;
	id: number;
	name: string;
	provinceCode: string;
	psgcCode: string;
	regionCode: string;
};

export type AddressAutocompleteItem = {
	barangay: {
		code: string;
		name: string;
	};
	cityMunicipality: {
		code: string;
		name: string;
	};
	label: string;
	province: {
		code: string;
		name: string;
	};
	region: {
		code: string;
		name: string;
	};
};

export type AddressAutocompleteDetails = {
	addressLine1?: string;
	addressLine2?: string;
};
