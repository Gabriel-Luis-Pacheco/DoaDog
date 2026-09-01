# Store Checklist

Android first.

## App Config

- Confirm `DoaDog/app.json` name, slug and version.
- Confirm icon and splash assets are final and not distorted.
- Use only required permissions: photos for dog images and foreground location for map.
- Set production `EXPO_PUBLIC_API_URL`.
- Confirm `DoaDog/eas.json` production profile points to the real API URL.

## Policies

- Publish `PRIVACY_POLICY.md` as a public privacy policy URL.
- Publish `TERMS_OF_USE.md` as a public terms of use URL.
- Explain personal data collected for adoption contact and donation receipts.
- Explain that payments are processed by backend/Abacate Pay and confirmed by webhook.

## Play Store

- Prepare short description.
- Prepare full description.
- Review `STORE_LISTING.md` and paste final approved copy into Play Console.
- Prepare screenshots for Home, Dog detail, Register dog, Donations/PIX, Partners and Profile.
- Prepare support email.
- Prepare data safety form.
- Build Android release with EAS or local native build.
- Create EAS secret `GOOGLE_SERVICE_ACCOUNT` before automated submit.

## iOS Future

- Review camera/photo/location permission copy.
- Prepare App Store privacy nutrition labels.
- Confirm Apple payment policy implications for donations before release.
