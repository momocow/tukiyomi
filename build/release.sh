git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git remote add origin-for-travis https://${GH_TOKEN}@github.com/momocow/tukiyomi.git > /dev/null 2>&1

git checkout deploy
npm run vers-bump
git push --quiet --set-upstream origin-for-travis deploy

git checkout master
git merge deploy
git push --quiet --set-upstream origin-for-travis master