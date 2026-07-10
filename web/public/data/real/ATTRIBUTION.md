# Real-data lab attribution

Retrieved and transformed on July 10, 2026. The browser uses only the compact
snapshots in this directory; it does not call a live dataset API.

## NHTSA Standing General Order ADS reports

- Source page: https://www.nhtsa.gov/es/node/103486
- Source CSV: https://static.nhtsa.gov/odi/ffdd/sgo-2021-01/SGO-2021-01_Incident_Reports_ADS.csv
- Snapshot: `nhtsa-ads-reports.json`
- Transformation: highest report version per Report ID; direct identifiers,
  entity names, coordinates, addresses, and narrative text removed.
- Important limitation: these reports have no common exposure denominator and
  cannot establish company or system crash rates.

## Tampa Connected Vehicle Pilot BSM sample

- Source: https://data.transportation.gov/Automobiles/Tampa-CV-Pilot-Basic-Safety-Message-BSM-Sample/nm7w-nvbm
- DOI: https://doi.org/10.21949/1504502
- License: CC BY-SA 4.0
- Recommended attribution: Tampa Hillsborough Expressway Authority (2019),
  provided by the USDOT ITS DataHub.
- Snapshot: `tampa-bsm.json`
- Transformation: one public pseudonymous trace (`coreData_id=8536100`),
  selected fields, ordered by RSU receive time, with J2735 scaled units
  converted to SI units.

## comma2k19

- Dataset card: https://huggingface.co/datasets/commaai/comma2k19/blob/main/README.md
- Original project: https://github.com/commaai/comma2k19
- License: MIT
- Citation: Harald Schafer, Eder Santana, Andrew Haden, and Riccardo Biasini,
  “A Commute in Data: The comma2k19 Dataset,” arXiv:1812.05752 (2018).
- Snapshot: `comma2k19-segment.json`
- Video: `../comma2k19/segment-10.mp4`
- Source segment: `b0c9d2329ad1606b|2018-07-27--06-03-57/10`.
- Transformation: first demo parquet row; fused ECEF pose and u-blox GNSS
  converted to one local coordinate frame; high-rate signals downsampled for
  browser delivery. The HEVC road video was transcoded to 960-pixel-wide H.264
  at CRF 25 and assigned its recorded 20 fps cadence (1,200 frames over 60 s).

## Real ORNL Automotive Dynamometer (ROAD) CAN Intrusion Dataset

- Source: https://zenodo.org/records/10462796
- DOI: https://doi.org/10.5281/zenodo.10462796
- License: CC BY 4.0
- Authors: Robert Bridges, Miki E. Verma, Michael D. Iannacone, Samuel C.
  Hollifield, Pablo Moriano, Steven Hespeler, Frank Combs, and Bill Kay.
- Snapshot: `road-can-attacks.json`
- Transformation: the physical fabrication and post-processed masquerade
  versions of `max_speedometer_attack_1` were streamed from the source ZIP and
  aggregated into 0.5-second windows.

## CASSI at UNC Charlotte disengagements

- Source: https://catalog.data.gov/dataset/cassi-at-unc-charlotte-disengagement
- Publisher: North Carolina Department of Transportation / Town of Cary
- License: CC0 1.0
- Snapshot: `cassi-disengagements.json`
- Transformation: retained structured operational fields and coarse location;
  omitted the free-text additional-information field.
- Data-quality note: the catalog calls this a 23-week pilot, while the current
  export contains 24 distinct numbered week labels (1 through 24). The lab
  exposes this discrepancy instead of silently rewriting it.

The deterministic build script is `web/scripts/prepare_real_data.py`. Each JSON
file also embeds its retrieval date, source, transformation, and dataset-specific
limitations so the UI can display them next to the evidence. `MANIFEST.json`
records the byte size and SHA-256 hash of every delivered snapshot and video.
