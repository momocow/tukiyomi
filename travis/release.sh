git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git remote add origin-for-travis https://${GH_TOKEN}@github.com/momocow/tukiyomi.git > /dev/null 2>&1

git checkout deploy
git push --quiet --set-upstream origin-for-travis deploy

git pull origin-for-travis master
git checkout master
git merge deploy
git push --quiet --set-upstream origin-for-travis master
