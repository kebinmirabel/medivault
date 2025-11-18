import { supabase } from "./supabaseClient";

/**
 * Generate a numeric OTP string with the given length (default 6).
 * Uses crypto RNG where available.
 */
function generateOtp(length = 6) {
	const max = 10 ** length;
	// Use crypto if available
	try {
		if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
			const array = new Uint32Array(1);
			crypto.getRandomValues(array);
			const num = array[0] % max;
			return String(num).padStart(length, "0");
		}
	} catch (e) {
		// fallthrough to Math.random
	}

	const num = Math.floor(Math.random() * max);
	return String(num).padStart(length, "0");
}

/**
 * Insert an OTP record into the `otp` table.
 *
 * Assumptions:
 * - `hospital` parameter is either an object containing at least an `id` (hospital id)
 *   and (optionally) `healthcare_staff_id` OR it may be a string representing the
 *   hospital id. If you need a different shape (for example passing the staff id
 *   separately), call site should provide those values.
 *
 * @param {object|string} hospital - hospital object or hospital id
 * @param {string} patient_id - patient id (uuid)
 * @returns {Promise<{ data: any|null, error: any|null }>} inserted row or error
 */
/**
 * Insert an OTP record into the `otp` table.
 * Accepts a single object parameter for clarity: { hospital_id, patient_id, healthcare_staff_id }
 */
export async function requestPatientData({ hospital_id, patient_id, healthcare_staff_id } = {}) {
	if (!patient_id) {
		return { data: null, error: new Error("patient_id is required") };
	}

	// Expect hospital_id and healthcare_staff_id to be provided explicitly by caller.
	const otp = generateOtp(6);
	const created_at = new Date().toISOString();

	const payload = {
		created_at,
		patient_id,
		hospital_id,
		healthcare_staff_id,
		otp,
	};

	try {
		const { data, error } = await supabase.from('otp').insert([payload]).select().single();
		if (error) {
			return { data: null, error };
		}
		return { data, error: null };
	} catch (err) {
		return { data: null, error: err };
	}
}

export default requestPatientData;

