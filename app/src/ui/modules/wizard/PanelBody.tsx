"use client";

import { type ReactNode } from "react";
import { useModulesWizard } from "@/app/src/hooks/modules/wizard/useModulesWizard";
import {
  ModulesWizardModuleOptions,
  ModulesWizardSetupOptions,
  ModulesWizardAccessOptions,
  ModulesWizardTeamOptions,
  type ModulesWizardOption,
} from "@/app/src/data/modules/wizard/ModulesWizardData";

type PanelBodyProps = {
  wizard: ReturnType<typeof useModulesWizard>;
};

export function PanelBody({ wizard }: PanelBodyProps) {
  const selectedModule = ModulesWizardModuleOptions.find(
    (option) => option.id === wizard.values.moduleId,
  );
  const selectedSetup = ModulesWizardSetupOptions.find(
    (option) => option.id === wizard.values.setupMode,
  );
  const selectedAccess = ModulesWizardAccessOptions.find(
    (option) => option.id === wizard.values.accessLevel,
  );
  const selectedTeam = ModulesWizardTeamOptions.find(
    (option) => option.id === wizard.values.assignedTeam,
  );

  if (wizard.currentStep.id === "module") {
    return (
      <OptionGrid
        options={ModulesWizardModuleOptions}
        selectedId={wizard.values.moduleId}
        onSelect={(moduleId) => wizard.updateValue("moduleId", moduleId)}
      />
    );
  }

  if (wizard.currentStep.id === "configuration") {
    return (
      <div className="grid gap-5">
        <OptionGrid
          options={ModulesWizardSetupOptions}
          selectedId={wizard.values.setupMode}
          onSelect={(setupMode) => wizard.updateValue("setupMode", setupMode)}
        />
        <FormField label="Target rollout date" description="Optional date for planning the first module release.">
          <input
            type="date"
            value={wizard.values.rolloutDate}
            onChange={(event) => wizard.updateValue("rolloutDate", event.target.value)}
            className="h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-darknavy focus:ring-2 focus:ring-darknavy/20"
          />
        </FormField>
      </div>
    );
  }

  if (wizard.currentStep.id === "access") {
    return (
      <div className="grid gap-5">
        <OptionGrid
          options={ModulesWizardAccessOptions}
          selectedId={wizard.values.accessLevel}
          onSelect={(accessLevel) => wizard.updateValue("accessLevel", accessLevel)}
        />
        <FormField label="Assigned team" description="Choose the first team responsible for this module.">
          <select
            value={wizard.values.assignedTeam}
            onChange={(event) => wizard.updateValue("assignedTeam", event.target.value)}
            className="h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-darknavy focus:ring-2 focus:ring-darknavy/20"
          >
            {ModulesWizardTeamOptions.map((team) => (
              <option key={team.id} value={team.id}>
                {team.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    );
  }

  if (wizard.currentStep.id === "review") {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-3">
          <ReviewRow label="Module" value={selectedModule?.title} />
          <ReviewRow label="Setup mode" value={selectedSetup?.title} />
          <ReviewRow label="Rollout date" value={wizard.values.rolloutDate || "Not scheduled"} />
          <ReviewRow label="Access level" value={selectedAccess?.title} />
          <ReviewRow label="Assigned team" value={selectedTeam?.label} />
        </div>
        <FormField label="Launch notes" description="Add short implementation notes for the module owner.">
          <textarea
            value={wizard.values.notes}
            onChange={(event) => wizard.updateValue("notes", event.target.value)}
            rows={8}
            className="w-full resize-none rounded-md border border-darknavy/15 bg-white px-3 py-3 text-sm leading-6 text-darknavy outline-none transition focus:border-darknavy focus:ring-2 focus:ring-darknavy/20"
            placeholder="Example: Enable finance managers first, then invite staff after opening balances are reviewed."
          />
        </FormField>
      </div>
    );
  }

  return null;
}

// --- Private sub-components ---

type OptionGridProps = {
  onSelect: (id: string) => void;
  options: ModulesWizardOption[];
  selectedId: string;
};

function OptionGrid({ onSelect, options, selectedId }: OptionGridProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          selected={option.id === selectedId}
          onSelect={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
}

type OptionCardProps = {
  onSelect: () => void;
  option: ModulesWizardOption;
  selected: boolean;
};

function OptionCard({ onSelect, option, selected }: OptionCardProps) {
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-h-40 flex-col rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/35 ${
        selected
          ? "border-darknavy/55 bg-darknavy/10 shadow-sm"
          : "border-darknavy/10 bg-white hover:border-darknavy/35 hover:bg-darknavy/5"
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-darknavy/6 text-darknavy">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {option.recommended ? (
          <span className="rounded bg-citron/25 px-2 py-1 text-xs font-semibold text-darknavy">Recommended</span>
        ) : null}
      </span>
      <span className="mt-4 text-base font-semibold text-darknavy">{option.title}</span>
      <span className="mt-2 text-sm leading-5 text-darknavy/60">{option.description}</span>
    </button>
  );
}

type FormFieldProps = {
  children: ReactNode;
  description: string;
  label: string;
};

function FormField({ children, description, label }: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-darknavy">{label}</span>
      <span className="mt-1 block text-sm leading-5 text-darknavy/55">{description}</span>
      <span className="mt-3 block">{children}</span>
    </label>
  );
}

type ReviewRowProps = {
  label: string;
  value?: string;
};

function ReviewRow({ label, value }: ReviewRowProps) {
  return (
    <div className="rounded-md border border-darknavy/10 bg-darknavy/2 p-4">
      <p className="text-xs font-semibold uppercase text-darknavy/45">{label}</p>
      <p className="mt-2 text-sm font-semibold text-darknavy">{value || "Not selected"}</p>
    </div>
  );
}
