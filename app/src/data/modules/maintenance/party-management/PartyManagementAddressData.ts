import type {
  PartyAddress,
  PartyClassification,
  PartyInformationRecord,
  PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

export function createEmptyPartyAddress(
  options: Partial<PartyAddress> = {},
): PartyAddress {
  return {
    id: options.id ?? "address-default",
    addressName: options.addressName ?? "Default Address",
    addressLine1: options.addressLine1 ?? "",
    addressLine2: options.addressLine2 ?? "",
    barangay: options.barangay ?? "",
    barangayCode: options.barangayCode ?? "",
    cityMunicipality: options.cityMunicipality ?? "",
    cityMunicipalityCode: options.cityMunicipalityCode ?? "",
    isBilling: Boolean(options.isBilling),
    isBuilding: Boolean(options.isBuilding),
    isDefault: options.isDefault ?? true,
    isDelivery: Boolean(options.isDelivery),
    isForeign: Boolean(options.isForeign),
    isHome: Boolean(options.isHome),
    province: options.province ?? "",
    provinceCode: options.provinceCode ?? "",
    region: options.region ?? "",
    regionCode: options.regionCode ?? "",
  };
}

function normalizePartyAddress(address: PartyAddress): PartyAddress {
  return {
    id: address.id,
    addressName: address.addressName.trim() || "Address",
    addressLine1: address.addressLine1.trim(),
    addressLine2: address.addressLine2.trim(),
    barangay: address.barangay.trim(),
    barangayCode: address.barangayCode,
    cityMunicipality: address.cityMunicipality.trim(),
    cityMunicipalityCode: address.cityMunicipalityCode,
    isBilling: address.isBilling,
    isBuilding: Boolean(address.isBuilding),
    isDefault: address.isDefault,
    isDelivery: address.isDelivery,
    isForeign: Boolean(address.isForeign),
    isHome: Boolean(address.isHome),
    province: address.province.trim(),
    provinceCode: address.provinceCode,
    region: address.region.trim(),
    regionCode: address.regionCode,
  };
}

export function normalizePartyAddresses(
  addresses: PartyAddress[],
  partyTypes: PartyType[] = [],
  classification: PartyClassification | "" = "",
) {
  return applyDefaultAddressRoles(
    addresses.map(normalizePartyAddress),
    partyTypes,
    classification,
  );
}

export function setPartyDefaultAddress(
  addresses: PartyAddress[],
  addressId?: string,
) {
  const requestedIndex = addressId
    ? addresses.findIndex((address) => address.id === addressId)
    : -1;
  const currentDefaultIndex = addresses.findIndex(
    (address) => address.isDefault,
  );
  const defaultIndex =
    requestedIndex >= 0
      ? requestedIndex
      : currentDefaultIndex >= 0
        ? currentDefaultIndex
        : 0;

  return addresses.map((address, index) => {
    const isDefault = index === defaultIndex;

    return {
      ...address,
      addressName: isDefault
        ? address.addressName.trim() || "Default Address"
        : address.addressName === "Default Address"
          ? `Address ${index + 1}`
          : address.addressName,
      isBilling: address.isBilling,
      isBuilding: address.isBuilding,
      isDefault,
      isDelivery: address.isDelivery,
      isForeign: isDefault ? false : address.isForeign,
      isHome: address.isHome,
    };
  }).sort((first, second) => Number(second.isDefault) - Number(first.isDefault));
}

export function clearAddressRolesForPartyTypes(
  addresses: PartyAddress[],
  partyTypes: PartyType[],
  classification: PartyClassification | "" = "",
) {
  return applyDefaultAddressRoles(addresses, partyTypes, classification);
}

export function applyDefaultAddressRoles(
  addresses: PartyAddress[],
  partyTypes: PartyType[],
  classification: PartyClassification | "" = "",
) {
  const normalizedPartyTypes = normalizePartyTypesForClassification(
    partyTypes,
    classification,
  );
  const addressRoles = getPartyAddressRoles(normalizedPartyTypes);

  if (addressRoles.length === 0) {
    return [createEmptyPartyAddress()];
  }

  return addressRoles.map((role, index) => {
    const sourceAddress =
      addresses.find((address) => getAddressRole(address) === role) ??
      (role === "billing" ? addresses[0] : undefined);
    const address = sourceAddress ?? createEmptyPartyAddress();

    return {
      ...address,
      id: address.id && getAddressRole(address) === role ? address.id : `address-${role}`,
      addressName: getAddressRoleLabel(role),
      isBilling: role === "billing",
      isBuilding: false,
      isDefault: index === 0,
      isDelivery: role === "delivery",
      isHome: role === "home",
    };
  });
}

export function normalizePartyTypesForClassification(
  partyTypes: PartyType[],
  classification: PartyClassification | "",
) {
  if (!classification) {
    return [];
  }

  return classification === "Non-Individual"
    ? partyTypes.filter(
        (partyType) => partyType !== "Employee" && partyType !== "Member",
      )
    : partyTypes;
}

export function normalizePartyAddressesForForm(record: PartyInformationRecord) {
  const addresses =
    record.addresses?.length > 0 ? record.addresses : [record.address];

  return normalizePartyAddresses(
    addresses.map((address, index) => ({
      ...createEmptyPartyAddress(),
      ...address,
      id: address.id || `${record.id}-address-${index + 1}`,
      addressName:
        address.addressName || (index === 0 ? "Default Address" : "Address"),
      isDefault: address.isDefault || index === 0,
    })),
    record.partyTypes,
    record.classification,
  );
}

export function getDefaultPartyAddress(addresses: PartyAddress[]) {
  return (
    setPartyDefaultAddress(addresses.map(normalizePartyAddress)).find(
      (address) => address.isDefault,
    ) ??
    createEmptyPartyAddress()
  );
}

export type PartyAddressRole = "billing" | "delivery" | "home";

export function getPartyAddressRoles(partyTypes: PartyType[]): PartyAddressRole[] {
  return [
    partyTypes.includes("Employee") || partyTypes.includes("Member")
      ? "home"
      : null,
    partyTypes.includes("Customer") || partyTypes.includes("Vendor")
      ? "billing"
      : null,
    partyTypes.includes("Customer") ? "delivery" : null,
  ].filter((role): role is PartyAddressRole => Boolean(role));
}

export function hasPersonalInformationPartyType(partyTypes: PartyType[]) {
  return partyTypes.includes("Employee") || partyTypes.includes("Member");
}

function getAddressRole(address: PartyAddress): PartyAddressRole | undefined {
  if (address.isHome) {
    return "home";
  }

  if (address.isDelivery) {
    return "delivery";
  }

  if (address.isBilling) {
    return "billing";
  }

  return undefined;
}

export function getAddressRoleLabel(role: PartyAddressRole) {
  switch (role) {
    case "billing":
      return "Billing Address";
    case "home":
      return "Home Address";
    case "delivery":
      return "Delivery Address";
  }
}
