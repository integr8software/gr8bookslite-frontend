"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Eraser, PenLine, Save } from "lucide-react";
import type { FormSignatoryRow } from "@/app/src/types/modules/system-administration/form-signatory/FormSignatoryTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type FormSignatorySignatureMakerProps = {
	row: FormSignatoryRow | null;
	onClose: () => void;
	onSave: (rowId: string, signatureImageUrl: string) => void;
};

export function FormSignatorySignatureMaker({
	row,
	onClose,
	onSave,
}: FormSignatorySignatureMakerProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const isDrawingRef = useRef(false);
	const [hasSignature, setHasSignature] = useState(false);

	useEffect(() => {
		if (!row || !canvasRef.current) {
			return;
		}

		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");

		if (!context) {
			return;
		}

		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.strokeStyle = "#111827";
		context.lineCap = "round";
		context.lineJoin = "round";
		context.lineWidth = 3;
		setHasSignature(false);
	}, [row]);

	function getCanvasPoint(event: PointerEvent<HTMLCanvasElement>) {
		const canvas = canvasRef.current;

		if (!canvas) {
			return null;
		}

		const rect = canvas.getBoundingClientRect();

		return {
			x: ((event.clientX - rect.left) / rect.width) * canvas.width,
			y: ((event.clientY - rect.top) / rect.height) * canvas.height,
		};
	}

	function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
		const point = getCanvasPoint(event);
		const context = canvasRef.current?.getContext("2d");

		if (!point || !context) {
			return;
		}

		isDrawingRef.current = true;
		context.beginPath();
		context.moveTo(point.x, point.y);
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
		if (!isDrawingRef.current) {
			return;
		}

		const point = getCanvasPoint(event);
		const context = canvasRef.current?.getContext("2d");

		if (!point || !context) {
			return;
		}

		context.lineTo(point.x, point.y);
		context.stroke();
		setHasSignature(true);
	}

	function stopDrawing() {
		isDrawingRef.current = false;
	}

	function clearSignature() {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");

		if (!canvas || !context) {
			return;
		}

		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, canvas.width, canvas.height);
		setHasSignature(false);
	}

	function saveSignature() {
		const canvas = canvasRef.current;

		if (!row || !canvas || !hasSignature) {
			return;
		}

		onSave(row.id, canvas.toDataURL("image/png"));
	}

	return (
		<ModuleDrawer
			isOpen={Boolean(row)}
			title="Signature Maker"
			description={`Draw the signature for ${row?.label ?? "this signatory"}.`}
			eyebrow={
				<span className="inline-flex items-center gap-1.5">
					<PenLine className="h-3.5 w-3.5" aria-hidden="true" />
					Form Signatory
				</span>
			}
			maxWidthClassName="max-w-3xl"
			onClose={onClose}
			footer={
				<div className="flex flex-wrap justify-end gap-2">
					<button
						type="button"
						onClick={clearSignature}
						className={moduleHeaderActionClassNames.secondary}
					>
						<Eraser className="h-4 w-4" aria-hidden="true" />
						Clear
					</button>
					<button
						type="button"
						disabled={!hasSignature}
						onClick={saveSignature}
						className={moduleHeaderActionClassNames.primary}
					>
						<Save className="h-4 w-4" aria-hidden="true" />
						Use Signature
					</button>
				</div>
			}
		>
			<div className="grid gap-4 p-6">
				<div className="rounded-lg border border-darknavy/10 bg-offwhite p-3">
					<canvas
						ref={canvasRef}
						width={900}
						height={260}
						onPointerDown={handlePointerDown}
						onPointerMove={handlePointerMove}
						onPointerUp={stopDrawing}
						onPointerLeave={stopDrawing}
						className="h-64 w-full touch-none rounded-md border border-darknavy/10 bg-white"
					/>
				</div>
				<p className="text-sm text-darknavy/55">
					Use your mouse, trackpad, or touch screen to draw inside the box.
				</p>
			</div>
		</ModuleDrawer>
	);
}
