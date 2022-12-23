Profile: TestPatient
Parent: Patient
Id: TestPatient
* id 1..1
* birthDate 1..1

Instance: TestPatientValide
InstanceOf: TestPatient
Usage: #example
* id = "1"
* birthDate = "1964-08-12"

Instance: TestPatientKaputt
InstanceOf: TestPatient
Usage: #example
* birthDate = "1964-08-12"