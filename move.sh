#!/bin/bash
set -eu
scriptdir=$(cd $(dirname $0) && pwd)
target_repo=$scriptdir

# Delete the source packages
FOR_REAL=false

# --quick: do copy, but don't delete
full=true
if [[ ${1:-} == "--quick" ]]; then
    full=false
fi

if [[ ! -d ../aws-cdk ]]; then
    echo "Not all directories are in the right locations!" >&2
    exit 1
fi


if $full; then
    git clean -qfdx packages
    mkdir -p packages/@aws-cdk
fi

move() {
    source_root="$1"
    source_dir="$2"
    target_dir=$target_repo/$3

    echo "Moving $source_dir => $target_dir"

    $scriptdir/move-produce-file-list.sh $source_root $source_dir >> move-paths.txt
    echo "rm -rf $source_root/$source_dir" >> move-delete-original.sh

    if [[ "$3" != "$2" ]]; then
        echo "mv $2 $3" >> move-rename-package.sh
        echo "git add $3" >> move-rename-package.sh
    fi
}

move_from_cdk() {
    move "../aws-cdk" "$1" "packages/$2"
}

apply_moves() {
    echo '------------------------------------------------------'
    echo '  APPLY MOVES'
    echo '------------------------------------------------------'
    branch=testing-branch
    (
        cd $1
        git checkout -b $branch origin/main || git checkout $branch
        git reset --hard origin/main

        git filter-repo --paths-from-file $scriptdir/move-paths.txt --refs $branch

        git remote add target $target_repo || git remote set-url target $target_repo
        git push target $branch --force
    )

    (
        cd $target_repo
        git merge $branch -m "chore: move original sources over" --allow-unrelated-histories
    )
}

apply_renames() {
    echo '------------------------------------------------------'
    echo '  APPLY RENAMES'
    echo '------------------------------------------------------'
    (
        cd $target_repo
        /bin/bash $scriptdir/move-rename-packages.sh
        git commit -am 'chore: rename packages to new locations'
    )
}

apply_tags() {
    echo '------------------------------------------------------'
    echo '  APPLY TAGS FROM NPM VERSIONS'
    echo '------------------------------------------------------'
    (
        cd $target_repo
        # Get some versions from NPM and apply their versions as tags
        # Set non-NPM packages to version 0.1.0 so projen doesn't fall into the "first release" workflow
        merge_base=$(git merge-base HEAD main)
        packages="$(cd packages && ls | grep -v @) $(cd packages && echo @*/*)"
        for package in $packages; do
            version=$(cd $TMPDIR && npm view $package version 2>/dev/null) || {
                version=0.1.0
            }
            echo "${package}@v${version}"
            git tag -f "${package}@v${version}" $merge_base
        done
    )
}

apply_deletes() {
    echo '------------------------------------------------------'
    echo '  APPLY DELETES'
    echo '------------------------------------------------------'
    (
        cd $1
        /bin/bash $scriptdir/move-delete-original.sh
        git commit -am 'chore: move packages out'
    )
}

# RESET
rm -f move-paths.txt
rm -f move-delete-original.sh
rm -f move-rename-packages.sh
touch move-rename-packages.sh

# COLLECT MOVES
move_from_cdk packages/@aws-cdk-testing/cli-integ @aws-cdk-testing/cli-integ

# APPLY_MOVES
apply_moves ../aws-cdk
apply_renames

if $FOR_REAL; then
    apply_deletes ../aws-cdk
fi

apply_tags