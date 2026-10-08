# Methodology

## Air quality

AirAware uses Open-Meteo's geocoding and air-quality API.

Displayed variables:
- US AQI
- PM2.5
- PM10
- NO2
- O3
- hourly values

The UI calls the value **modelled US AQI** and does not present it as official CPCB station AQI.

## Transport

Monthly distance:
`one-way distance × 2 × trips per week × 52/12`

Fuel vehicles:
`monthly distance / efficiency × fuel factor`

Shared cars:
the estimate is divided by the entered occupants.

EV:
`monthly distance × kWh/100km / 100 × configurable electricity factor`

Bus/rail:
configurable passenger-km prototype factors.

These estimates are intentionally transparent and not a certified carbon inventory.
