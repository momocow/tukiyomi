export SENTRY_RELEASE_VERSION=$(sentry-cli releases propose-version)
echo $SENTRY_RELEASE_VERSION > ./assets/RELEASE
