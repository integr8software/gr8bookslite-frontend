export type PhilippineRegion = {
	code: string;
	islandGroupCode?: string;
	name: string;
	regionName?: string;
};

export type PhilippineProvince = {
	code: string;
	islandGroupCode?: string;
	name: string;
	regionCode: string;
};

export type PhilippineCityMunicipality = {
	code: string;
	districtCode?: string;
	islandGroupCode?: string;
	name: string;
	provinceCode?: string;
	regionCode: string;
};

export type PhilippineBarangay = {
	cityCode?: string;
	code: string;
	districtCode?: string;
	islandGroupCode?: string;
	municipalityCode?: string;
	name: string;
	provinceCode?: string;
	regionCode: string;
};
