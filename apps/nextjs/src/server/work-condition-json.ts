import type { EmployeeFormValues } from "@/lib/schemas/employee";

export const buildWorkingHoursJson = (values: EmployeeFormValues["workingHours"], keyPrefix: string) =>
  values.map((slot, index) => ({
    id: `${keyPrefix}-wh-${index + 1}`,
    start_time: slot.start,
    end_time: slot.end,
  }));

export const buildBreakHoursJson = (
  values: Array<{ start: string; end: string }>,
  keyPrefix: string,
) =>
  values.map((slot, index) => ({
    id: `${keyPrefix}-bh-${index + 1}`,
    start_time: slot.start,
    end_time: slot.end,
  }));

export const buildWorkLocationsJson = (
  values: EmployeeFormValues["workLocations"],
  keyPrefix: string,
) =>
  values.map((location, index) => ({
    id: `${keyPrefix}-wl-${index + 1}`,
    company_name: location.companyName?.trim() || null,
    office_name: location.officeName?.trim() || null,
    address: location.address?.trim() || null,
    phone_number: location.phoneNumber?.trim() || null,
    location: location.location?.trim() || null,
  }));

export const buildTransportationRoutesJson = (
  values: EmployeeFormValues["transportationRoutes"],
  keyPrefix: string,
) =>
  values.map((route, index) => ({
    id: `${keyPrefix}-tr-${index + 1}`,
    route: route.route?.trim() || null,
    usage_period: route.usagePeriod?.trim() || null,
    transportation_name: route.transportationName?.trim() || null,
    round_trip_amount: route.roundTripAmount,
    monthly_pass_amount: route.monthlyPassAmount ?? null,
    max_amount: route.maxAmount ?? null,
    nearest_station: route.nearestStation?.trim() || null,
  }));
