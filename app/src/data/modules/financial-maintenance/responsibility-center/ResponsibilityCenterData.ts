import type {
  FlattenedResponsibilityCenterTreeNode,
  ResponsibilityCenter,
  ResponsibilityCenterClassification,
  ResponsibilityCenterFormValues,
  ResponsibilityCenterTreeNode,
  ResponsibilityCenterTypeOption,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import { cleanOptional } from "@/app/src/utils/string.util";

export const ResponsibilityCenterInitialFormValues: ResponsibilityCenterFormValues = {
  code: "",
  name: "",
  classificationId: "",
  typeId: "",
  category: "Department",
  financialType: "Cost Center",
  manager: "",
  parentId: "",
  status: "Active",
  description: "",
};

export function createProjectResponsibilityCenterInitialValues(
  classifications: ResponsibilityCenterClassification[],
  types: ResponsibilityCenterTypeOption[],
): ResponsibilityCenterFormValues {
  const projectType = types.find((type) => type.name === "Project");
  const projectClassification = classifications.find(
    (classification) => classification.id === projectType?.classificationId,
  );
  const costCenterClassification = classifications.find(
    (classification) => classification.name === "Cost Center",
  );
  const classification = projectClassification ?? costCenterClassification;

  return {
    ...ResponsibilityCenterInitialFormValues,
    category: "Project",
    classificationId: classification?.id ?? "",
    financialType: classification?.name ?? "Cost Center",
    typeId: projectType?.id ?? "",
  };
}

export function buildResponsibilityCenterTree(centers: ResponsibilityCenter[]): ResponsibilityCenterTreeNode[] {
  const nodeById = new Map<string, ResponsibilityCenterTreeNode>();

  centers.forEach((center) => {
    nodeById.set(center.id, { ...center, children: [] });
  });

  const roots: ResponsibilityCenterTreeNode[] = [];

  nodeById.forEach((node) => {
    const parent = node.parentId ? nodeById.get(node.parentId) : undefined;

    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function flattenResponsibilityCenterTree(
  nodes: ResponsibilityCenterTreeNode[],
  expandedIds: Set<string>,
  level = 0,
): FlattenedResponsibilityCenterTreeNode[] {
  return nodes.flatMap((node) => {
    const current: FlattenedResponsibilityCenterTreeNode = {
      center: node,
      childrenCount: node.children.length,
      level,
    };

    if (!expandedIds.has(node.id)) {
      return [current];
    }

    return [current, ...flattenResponsibilityCenterTree(node.children, expandedIds, level + 1)];
  });
}

export function getResponsibilityCenterExpandableIds(centers: ResponsibilityCenter[]) {
  const parentIds = new Set<string>();

  centers.forEach((center) => {
    if (center.parentId) {
      parentIds.add(center.parentId);
    }
  });

  return parentIds;
}

export function createResponsibilityCenterFormValues(center: ResponsibilityCenter): ResponsibilityCenterFormValues {
  return {
    code: center.code,
    name: center.name,
    classificationId: center.classificationId,
    typeId: center.typeId,
    category: center.category,
    financialType: center.financialType,
    manager: center.manager,
    parentId: center.parentId ?? "",
    status: center.status,
    description: center.description ?? "",
  };
}

export function createResponsibilityCenterFromForm(values: ResponsibilityCenterFormValues): ResponsibilityCenter {
  const now = new Date().toISOString();

  return {
    id: `rc-${Date.now()}`,
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    classificationId: values.classificationId,
    classificationCode: "",
    classificationName: values.financialType,
    typeId: values.typeId,
    typeName: values.category,
    typeCodePrefix: "",
    category: values.category,
    financialType: values.financialType,
    manager: values.manager.trim(),
    parentId: cleanOptional(values.parentId),
    status: values.status,
    description: cleanOptional(values.description),
    createdBy: "Current User",
    createdAt: now,
    updatedBy: "Current User",
    updatedAt: now,
  };
}

export function updateResponsibilityCenterFromForm(
  center: ResponsibilityCenter,
  values: ResponsibilityCenterFormValues,
): ResponsibilityCenter {
  return {
    ...createResponsibilityCenterFromForm(values),
    id: center.id,
    createdBy: center.createdBy,
    createdAt: center.createdAt,
    updatedBy: "Current User",
    updatedAt: new Date().toISOString(),
  };
}

export function getResponsibilityCenterTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 13) return "min-w-[168rem]";
  if (visibleColumnCount === 12) return "min-w-[156rem]";
  if (visibleColumnCount === 11) return "min-w-[144rem]";
  if (visibleColumnCount === 10) return "min-w-[132rem]";
  if (visibleColumnCount === 9) return "min-w-[120rem]";
  if (visibleColumnCount === 8) return "min-w-[108rem]";
  if (visibleColumnCount === 7) return "min-w-[96rem]";
  return "min-w-[82rem]";
}
