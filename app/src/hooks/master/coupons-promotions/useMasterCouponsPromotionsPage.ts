"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
	InitialMasterCouponPromotionFormValues,
	MasterCouponPromotionRecords,
	createMasterCouponPromotionFormValues,
	createMasterCouponPromotionRecord,
	updateMasterCouponPromotionRecord,
} from "@/app/src/data/master/coupons-promotions/MasterCouponPromotionData";
import type {
	MasterCouponPromotionFormErrors,
	MasterCouponPromotionFormValues,
	MasterCouponPromotionRecord,
} from "@/app/src/types/master/coupons-promotions/MasterCouponPromotionTypes";
import { validateMasterCouponPromotionForm } from "@/app/src/validations/master/coupons-promotions/MasterCouponPromotionValidation";

export function useMasterCouponsPromotionsPage() {
	const [records, setRecords] = useState(MasterCouponPromotionRecords);
	const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
	const [formValues, setFormValues] =
		useState<MasterCouponPromotionFormValues>(
			InitialMasterCouponPromotionFormValues,
		);
	const [formErrors, setFormErrors] =
		useState<MasterCouponPromotionFormErrors>({});

	const summary = useMemo(() => {
		const activeRecords = records.filter(
			(record) => record.status === "Active",
		).length;
		const promoRecords = records.filter(
			(record) => record.type === "Promo",
		).length;
		const couponRecords = records.filter(
			(record) => record.type === "Coupon",
		).length;
		const voucherRecords = records.filter(
			(record) => record.type === "Voucher",
		).length;

		return {
			activeRecords,
			couponRecords,
			promoRecords,
			voucherRecords,
		};
	}, [records]);

	function updateForm(values: Partial<MasterCouponPromotionFormValues>) {
		setFormValues((current) => ({ ...current, ...values }));
	}

	function editRecord(record: MasterCouponPromotionRecord) {
		setEditingRecordId(record.id);
		setFormValues(createMasterCouponPromotionFormValues(record));
		setFormErrors({});
	}

	function resetForm() {
		setEditingRecordId(null);
		setFormValues(InitialMasterCouponPromotionFormValues);
		setFormErrors({});
	}

	function saveRecord() {
		const errors = validateMasterCouponPromotionForm({
			editingRecordId,
			records,
			values: formValues,
		});

		setFormErrors(errors);

		if (Object.keys(errors).length > 0) {
			return;
		}

		if (editingRecordId) {
			setRecords((current) =>
				current.map((record) =>
					record.id === editingRecordId
						? updateMasterCouponPromotionRecord({
								record,
								values: formValues,
							})
						: record,
				),
			);
			toast.success("Promotion updated.");
		} else {
			setRecords((current) => [
				createMasterCouponPromotionRecord(formValues),
				...current,
			]);
			toast.success("Promotion created.");
		}

		resetForm();
	}

	function toggleRecordStatus(recordId: string) {
		const record = records.find((candidate) => candidate.id === recordId);

		if (!record) {
			return;
		}

		const nextStatus =
			record.status === "Active" ? "Inactive" : "Active";

		setRecords((current) =>
			current.map((candidate) =>
				candidate.id === recordId
					? { ...candidate, status: nextStatus }
					: candidate,
			),
		);

		if (editingRecordId === recordId) {
			setFormValues((current) => ({ ...current, status: nextStatus }));
		}

		toast.success(
			nextStatus === "Active" ? "Promotion activated." : "Promotion inactivated.",
		);
	}

	return {
		editingRecordId,
		formErrors,
		formValues,
		records,
		summary,
		editRecord,
		resetForm,
		saveRecord,
		toggleRecordStatus,
		updateForm,
	};
}
