"use client";

import {
  PartyCivilStatusOptions,
  PartyClassificationOptions,
  PartyDefaultNationality,
  PartyGenderOptions,
  PartyManagementFieldClassName,
  PartyManagementSelectClassName,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import { getSingleSelectedValue } from "@/app/src/data/modules/party-management/PartyInformationTabsData";
import type {
  PartyBasicInformationTabProps,
  PartyInformationStatusFieldProps,
} from "@/app/src/types/modules/party-management/PartyInformationTabsTypes";
import type { PartyEntityType } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { Field } from "@/app/src/ui/modules/party-management/forms/PartyInformationField";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import {
  MaintenanceActiveStatusSwitchOption,
  MaintenanceInactiveStatusSwitchOption,
} from "@/app/src/utils/status.util";

export function PartyBasicInformationTab({
  errors,
  isClassificationSelected,
  isPartyCodeReadonly,
  isReadonly,
  values,
  onInputChange,
  onPartyTypesChange,
  onUpdateField,
  isDetailsDisabled,
  showBusinessNameFields,
  showPersonalInfoFields,
  showMemberRegistrationDate,
  isMember,
  showPartyEntityTypeField,
  partyTypeSelectOptions,
  partyEntityTypeSelectOptions,
  honorificOptions,
}: PartyBasicInformationTabProps) {
  return (
    <div className="grid gap-5">
      <div
        className={
          showPartyEntityTypeField
            ? "grid gap-4 lg:grid-cols-4"
            : "grid gap-4 lg:grid-cols-3"
        }
      >
        <Field label="Party Code" error={errors.partyCodeNo} required>
          <input
            name="partyCodeNo"
            value={values.partyCodeNo}
            onChange={onInputChange}
            readOnly={isReadonly || isPartyCodeReadonly}
            className={PartyManagementFieldClassName}
          />
        </Field>
        <Field
          label="Party Classification"
          error={errors.classification}
          required
        >
          <select
            name="classification"
            disabled={isReadonly}
            value={values.classification}
            onChange={onInputChange}
            className={PartyManagementSelectClassName}
          >
            <option value="">--Select Classification--</option>
            {PartyClassificationOptions.map((classification) => (
              <option key={classification} value={classification}>
                {classification}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Party Type" error={errors.partyTypes} required>
          <AppAdvancedDropdown
            disabled={isReadonly || !isClassificationSelected}
            isSearchable={false}
            options={partyTypeSelectOptions}
            placeholder={
              isClassificationSelected
                ? "--Select Party Type--"
                : "--Select Classification First--"
            }
            removeSelectionOnSelectedOptionClick
            selectionMode="multiple"
            showSelectionRemoveButton={false}
            value={values.partyTypes}
            onChange={onPartyTypesChange}
          />
        </Field>
        {showPartyEntityTypeField ? (
          <Field label="Party Entity" error={errors.partyEntityType} required>
            <AppAdvancedDropdown
              disabled={isDetailsDisabled}
              emptyMessage="No matching entity type found."
              options={partyEntityTypeSelectOptions}
              placeholder="--Select Entity Type--"
              searchPlaceholder="Search entity type"
              value={values.partyEntityType}
              onChange={(value) =>
                onUpdateField(
                  "partyEntityType",
                  getSingleSelectedValue(value) as PartyEntityType | "",
                )
              }
            />
          </Field>
        ) : null}
      </div>

      {showBusinessNameFields ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Party Name" error={errors.partyName} required>
            <input
              name="partyName"
              value={values.partyName}
              onChange={onInputChange}
              readOnly={isReadonly}
              disabled={isDetailsDisabled}
              className={PartyManagementFieldClassName}
            />
          </Field>
          <Field label="Trade Name">
            <input
              name="tradeName"
              value={values.tradeName}
              onChange={onInputChange}
              readOnly={isReadonly}
              disabled={isDetailsDisabled}
              className={PartyManagementFieldClassName}
            />
          </Field>
        </div>
      ) : null}

      {values.classification === "Individual" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)_minmax(0,1.15fr)_minmax(0,1.25fr)_minmax(0,0.85fr)]">
          <Field label="First Name" error={errors.firstName} required>
            <input
              name="firstName"
              value={values.firstName}
              onChange={onInputChange}
              readOnly={isReadonly}
              disabled={isDetailsDisabled}
              className={PartyManagementFieldClassName}
            />
          </Field>
          <Field label="Middle Name">
            <input
              name="middleName"
              value={values.middleName}
              onChange={onInputChange}
              readOnly={isReadonly}
              disabled={isDetailsDisabled}
              className={PartyManagementFieldClassName}
            />
          </Field>
          <Field label="Last Name" error={errors.lastName} required>
            <input
              name="lastName"
              value={values.lastName}
              onChange={onInputChange}
              readOnly={isReadonly}
              disabled={isDetailsDisabled}
              className={PartyManagementFieldClassName}
            />
          </Field>
          <Field label="Suffix">
            <input
              name="suffixName"
              value={values.suffixName}
              onChange={onInputChange}
              readOnly={isReadonly}
              disabled={isDetailsDisabled}
              className={PartyManagementFieldClassName}
            />
          </Field>
          <Field label="Honorific">
            <AppAdvancedDropdown
              disabled={isDetailsDisabled}
              isSearchable={false}
              options={honorificOptions}
              placeholder="--Select Honorific--"
              value={values.honorific}
              onChange={(value) =>
                onUpdateField("honorific", getSingleSelectedValue(value))
              }
              showSelectionIndicator={false}
              showSelectedDetails={false}
            />
          </Field>
        </div>
      ) : null}

      {showPersonalInfoFields ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="Gender" error={errors.gender} required={isMember}>
            <select
              name="gender"
              value={values.gender}
              onChange={onInputChange}
              disabled={isDetailsDisabled}
              className={PartyManagementSelectClassName}
            >
              <option value="">--Select Gender--</option>
              {PartyGenderOptions.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Civil Status"
            error={errors.civilStatus}
            required={isMember}
          >
            <select
              name="civilStatus"
              value={values.civilStatus}
              onChange={onInputChange}
              disabled={isDetailsDisabled}
              className={PartyManagementSelectClassName}
            >
              <option value="">--Select Civil Status--</option>
              {PartyCivilStatusOptions.map((civilStatus) => (
                <option key={civilStatus} value={civilStatus}>
                  {civilStatus}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Nationality"
            error={errors.nationality}
            required={isMember}
          >
            <input
              name="nationality"
              value={values.nationality || PartyDefaultNationality}
              onChange={onInputChange}
              readOnly={isReadonly}
              disabled={isDetailsDisabled}
              className={PartyManagementFieldClassName}
            />
          </Field>
        </div>
      ) : null}

      {showMemberRegistrationDate ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Field
            label="Member Registration Date"
            error={errors.memberRegistrationDate}
            required
          >
            <input
              name="memberRegistrationDate"
              type="date"
              value={values.memberRegistrationDate}
              onChange={onInputChange}
              readOnly={isReadonly}
              disabled={isDetailsDisabled}
              className={PartyManagementFieldClassName}
            />
          </Field>
          <StatusField
            error={errors.status}
            isReadonly={isReadonly}
            value={values.status}
            onValueChange={(status) => onUpdateField("status", status)}
          />
        </div>
      ) : null}

      {showMemberRegistrationDate ? null : (
        <div className="grid gap-4 lg:grid-cols-3">
          <StatusField
            error={errors.status}
            isReadonly={isReadonly}
            value={values.status}
            onValueChange={(status) => onUpdateField("status", status)}
          />
        </div>
      )}
    </div>
  );
}

function StatusField({
  error,
  isReadonly,
  value,
  onValueChange,
}: PartyInformationStatusFieldProps) {
  return (
    <Field label="Status" error={error} required>
      <AppSwitch
        falseOption={MaintenanceInactiveStatusSwitchOption}
        value={value}
        onChange={onValueChange}
        readOnly={isReadonly}
        trueOption={MaintenanceActiveStatusSwitchOption}
      />
    </Field>
  );
}
