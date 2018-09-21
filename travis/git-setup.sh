git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git remote add origin-for-travis https://${GH_TOKEN}@github.com/momocow/tukiyomi.git
git checkout deploy