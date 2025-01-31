setInterval(function () {
  setCopy()
}, 2000);

function setCopy() {
  tryCreateBranchLink()
  tryCreateBranchDropdownLink()
  trySetCopyInvestigationsImpl(document.getElementsByClassName("testWithDetails"))
  trySetCopyImpl(document.getElementsByClassName("TestItemPreview__name--y5")) // Overview tab
  trySetCopyImpl(document.getElementsByClassName("TestItemAdvanced__testCol--PW")) // Tests tab
  trySetCopyInCompareImpl(document.getElementsByClassName("TestRow__nameCol--MD"))
}

function createCopyLink(textToCopyGetter, copyLinkClass, attachBeforeElement) {

  const attachTo = attachBeforeElement.parentNode

  const copyText = "|Copy|"
  const copiedText = "|Copied|"
  const nothingToCopyText = "|Nothing to copy|"

  const link = document.createElement("a")
  link.setAttribute("class", copyLinkClass)
  link.setAttribute("style", "margin-right: 5px; cursor: pointer;")
  const textNode = document.createTextNode(copyText)
  link.appendChild(textNode)

  link.addEventListener('click', function (event) {
    event.stopPropagation();
    const textToCopy = textToCopyGetter()
    textNode.textContent = textToCopy ? copiedText : nothingToCopyText
    const interval = setInterval(function () {
      clearInterval(interval)
      textNode.textContent = copyText
    }, 2000);
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
    }
  })

  attachTo.insertBefore(link, attachBeforeElement)
}

function tryCreateBranchLink() {
  const branchList = document.getElementsByClassName("OverviewBuildHeader__subHeader--Mg")
  if (!branchList || branchList.length !== 1) return
  const branchLink = branchList[0]

  const anchorElement = branchLink.querySelector(`.BuildBranch__build-branch--Tg`)
  if (!anchorElement) return

  const copyLinkClass = "TeamCity__branchLink__copy"
  if (branchLink.parentNode.querySelector(`.${copyLinkClass}`)) return

  const textElement = branchLink.querySelector(".MiddleEllipsis__searchable--Tv")
  if (!textElement) return

  const textToCopy = textElement.textContent
  createCopyLink(() => textToCopy, copyLinkClass, anchorElement)
}

function tryCreateBranchDropdownLink() {
  const dropDownList = document.getElementsByClassName("OverviewBuildTypeHeader__branchFilter--xm")
  if (!dropDownList || dropDownList.length !== 1) return
  const dropDown = dropDownList[0]

  const copyLinkClass = "TeamCity__BranchDropdown__copy"
  if (dropDown.parentNode.querySelector(`.${copyLinkClass}`)) return

  const dropDownTextElement = dropDown.querySelector(".BranchSelect__newLabel--yt")
  if (!dropDownTextElement) return false

  const textGetter = () => {
    const rawTextContent = dropDownTextElement.textContent
    if (rawTextContent === "My Branches" || rawTextContent === "<All branches>" || rawTextContent === "<Branch group>") return undefined
    const defaultBranchPrefix = "Default branch ("
    return rawTextContent.startsWith(defaultBranchPrefix)
      ? rawTextContent.slice(defaultBranchPrefix.length, -1)
      : rawTextContent
  }

  createCopyLink(textGetter, copyLinkClass, dropDown)
}

function trySetCopyInvestigationsImpl(rows) {
  if (!rows || rows.length === 0) return
  const copyLinkClass = "TeamCity__TestName__Investigations__copy"

  for (const currentRow of rows) {
    if (currentRow.parentNode.querySelector(`.${copyLinkClass}`)) return

    const rowChilds = currentRow.childNodes
    if (!rowChilds || rowChilds.length < 3) continue

    const className = rowChilds[0]
    if (!className) return
    const methodName = rowChilds[2]
    if (!methodName) return

    const fqn = className.textContent.replaceAll("$", ".") + methodName.textContent.trim()
    createCopyLink(() => fqn, copyLinkClass, currentRow)
  }
}

String.prototype.substringBefore = function (substring) {
  return this.substring(0, this.indexOf(substring))
}

function trySetCopyInCompareImpl(rows) {
  if (!rows || rows.length === 0) return
  const copyLinkClass = "TeamCity__TestName__In__Compare__copy"

  for (const currentRow of rows) {

    if (currentRow.querySelector(`.${copyLinkClass}`)) return

    const linkNode = currentRow.querySelector(".ring-link-inner")
    if (!linkNode) continue

    const rawFqn = linkNode.textContent
    const fqn = rawFqn.replaceAll("$", ".").substringBefore("[")
    createCopyLink(() => fqn, copyLinkClass, linkNode.parentNode)
  }
}

function trySetCopyImpl(rows) {
  if (!rows || rows.length === 0) return
  const copyLinkClass = "TeamCity__TestName__copy"

  for (let currentRow of rows) {
    if (currentRow.querySelector(`.${copyLinkClass}`)) return

    const className = currentRow.querySelector(".TestName__class--gL")
    if (!className) return
    const methodName = currentRow.querySelector(".TestName__name--lG")
    if (!methodName) return

    const attachBeforeElement = currentRow.querySelector(".TestItemAdvanced__name--_G") ?? className

    const fqn = `${className.textContent.replaceAll("$", ".")}.${methodName.textContent}`.substringBefore("[")

    createCopyLink(() => fqn, copyLinkClass, attachBeforeElement)
  }
}
