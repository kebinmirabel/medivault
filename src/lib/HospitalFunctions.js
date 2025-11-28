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
 * @param {object|string} hospital - hospital object or hospital id
 * @param {string} patient_id - patient id (uuid)
 * @returns {Promise<{ data: any|null, error: any|null }>} inserted row or error
 */
/*
 * Insert an OTP record into the `otp` table.
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

/**
 * Verify OTP by checking if it exists in the otp table.
 * If found, inserts the record into accepted_requests table and deletes from otp table.
 *
 * @param {string} otp - OTP code to verify
 * @returns {Promise<{ data: any|null, error: any|null }>} success or error
 */
export async function verifyOtp(otp) {
	if (!otp || otp.trim().length === 0) {
		return { data: null, error: new Error("OTP is required") };
	}

	try {
		// 1. Check if OTP exists in otp table
		const { data: otpRecord, error: fetchError } = await supabase
			.from('otp')
			.select('id, patient_id, hospital_id, healthcare_staff_id')
			.eq('otp', otp.trim())
			.single();

		if (fetchError || !otpRecord) {
			return { data: null, error: new Error("OTP not found or invalid") };
		}

		const { id: otpId, patient_id, hospital_id, healthcare_staff_id } = otpRecord;

		// 2. Insert into accepted_requests table
		const { data: insertData, error: insertError } = await supabase
			.from('accepted_requests')
			.insert([{
				patient_id,
				hospital_id,
				healthcare_staff_id,
				created_at: new Date().toISOString(),
			}])
			.select()
			.single();

		if (insertError) {
			return { data: null, error: insertError };
		}

		// 3. Delete from otp table using RLS bypass (service role)
		// If RLS policy prevents deletion, we may need to use a stored procedure
		// For now, attempt direct deletion
		const { data: deleteData, error: deleteError } = await supabase
			.from('otp')
			.delete()
			.match({ id: otpId });

		if (deleteError) {
			console.error("Error deleting OTP:", deleteError);
			// If deletion fails due to RLS, log but still return success since insert worked
			console.warn("OTP record not deleted (RLS may be blocking), but accepted_requests was created");
		}

		return { data: insertData, error: null };
	} catch (err) {
		console.error("verifyOtp error:", err);
		return { data: null, error: err };
	}
}

export default requestPatientData;

