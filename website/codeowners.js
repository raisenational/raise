// IMPORTANT: Consult the national team before editing this file. This file catches errors, but can't check itself.
// And yes, this can be easily bypassed. The point is to prevent accidental changes, rather than protect against attackers.

// Map from Git user.name to path prefixes they are allowed to change
const userAccess = {
  "Adam Jones": [""],
  "Joe Benton": [""],
  "Susanne Karbe": [""],
  "Andrew Launer": ["src/pages/glasgow/"],
}

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

const { exec } = require("child_process")

/**
 * @returns {Promise<{ user: string, paths: string[] }[]>}
 */
const getCommits = (target = "origin/master", source = "HEAD") => new Promise((resolve, reject) => {
  exec("git fetch origin master --quiet", (fetchError, fetchStdout, fetchStderr) => {
    if (fetchError) reject(fetchError)
    else if (fetchStderr) reject(fetchStderr)
    else {
      exec(`git log --name-only --format='|%an' ${target}..${source} --reverse`, (logError, logStdout, logStderr) => {
        if (logError) reject(logError)
        else if (logStderr) reject(logStderr)
        else {
          resolve(logStdout.split("|").slice(1).map((s) => {
            const [user, paths] = s.trim().split("\n\n")
            return {
              user,
              paths: paths.split("\n"),
            }
          }))
        }
      })
    }
  })
})

const getCurrentBranch = () => new Promise((resolve, reject) => {
  exec("git branch --show-current", (error, stdout, stderr) => {
    if (error) reject(error)
    else if (stderr) reject(stderr)
    else resolve(stdout.trim())
  })
});

(async () => {
  const commits = await getCommits()
  const unapprovedPaths = new Set()

  for (const commit of commits) {
    commit.paths.forEach((p) => unapprovedPaths.add(p))
    const access = userAccess[commit.user]
    if (Array.isArray(access)) {
      for (const path of unapprovedPaths) {
        if (access.some((p) => path.startsWith(p))) {
          unapprovedPaths.delete(path)
        }
      }
    }
  }

  if (unapprovedPaths.size !== 0) {
    console.error("You do not have permission to edit:")
    unapprovedPaths.forEach((p) => console.log(`- ${p}`))
    console.error("")
    console.error("If these changes were intentional, contact the national team for approval")
    console.error("They can approve by running:")
    console.error(`    git fetch && git checkout ${await getCurrentBranch()}`)
    console.error("    git commit -m \"Approve changes to restricted files\" --allow-empty")
    process.exit(1)
  }

  process.exit(0)
})()
