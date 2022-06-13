package abac

default allow := false

allow {
	user_is_patient
	action_is_write
	user_is_same_patient
}

allow {
	user_is_doctor
	action_is_read
	user_is_doctor_of_patient
}

allow {
	user_is_doctor
	action_is_write
	user_is_doctor_of_patient
}

allow {
	user_is_legal_guardian
	action_is_read
	user_is_legal_guardian_of_patient
}

allow {
	user_is_data_analyst
	action_is_read
}

user_is_doctor {
	data.user_attributes[input.user].role == "doctor"
}

user_is_patient {
	data.user_attributes[input.user].role == "patient"
}

user_is_data_analyst {
	data.user_attributes[input.user].role == "data_analyst"
}

user_is_legal_guardian {
	data.user_attributes[input.user].role == "legal_guardian"
}

action_is_read {
	input.action == "read"
}

action_is_write {
	input.action == "write"
}

user_is_legal_guardian_of_patient {
	data.data_attributes[input.resource].legal_guardian == input.user
}

user_is_doctor_of_patient {
	data.data_attributes[input.resource].doctor == input.user
}

user_is_same_patient {
	data.data_attributes[input.resource].patient == input.user
}
