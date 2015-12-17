'use strict'

module.exports.getDiffer = getDiffer

function createMatrix(m, n) {
  var res = []
  for (var i = 0; i < m; i++){
    var row = []
    for (var j = 0; j < n; j++) {
      row.push({
        length: 0,
        sequences: []
      })
    }
    res.push(row)
  }
  return res
}

function copySequences(source, dest) {
  for(var i = 0; i < source.length; i++) {
    dest.push([].concat(source[i]))
  }
}

function longestCommonSubsequence(first, second) {
  var matrix = createMatrix(first.length + 1, second.length + 1)
  for (var i = 0; i < first.length; i++) {
    for (var j = 0; j < second.length; j++) {
      if (first[i] === second[j]) {
        matrix[i + 1][j + 1].length = 1 + matrix[i][j].length

        if (matrix[i][j].sequences.length > 0) {
          copySequences(matrix[i][j].sequences, matrix[i + 1][j + 1].sequences)
        } else {
          matrix[i + 1][j + 1].sequences.push([])
        }

        for (var k = 0; k < matrix[i + 1][j + 1].sequences.length; k++) {
          matrix[i + 1][j + 1].sequences[k].push(first[i])
        }

        continue
      }

      if (matrix[i][j + 1].length > matrix[i + 1][j].length) {
        matrix[i + 1][j + 1].length = matrix[i][j + 1].length
        copySequences(matrix[i][j + 1].sequences, matrix[i + 1][j + 1].sequences)
        continue
      }

      if (matrix[i][j + 1].length < matrix[i + 1][j].length) {
        copySequences(matrix[i + 1][j].sequences, matrix[i + 1][j + 1].sequences)
        matrix[i + 1][j + 1].length = matrix[i + 1][j].length
        continue
      }

      copySequences(matrix[i][j + 1].sequences, matrix[i + 1][j + 1].sequences)
      copySequences(matrix[i + 1][j].sequences, matrix[i + 1][j + 1].sequences)
      matrix[i + 1][j + 1].length = matrix[i][j + 1].length
    }
  }
  return matrix[first.length][second.length]
}

function getDiff(tokens, lcs) {
  var index = 0
  var res = []
  for (var i = 0; i < tokens.length; i++) {
    if (lcs[index] === tokens[i]) {
      if (++index === lcs.length) {
        return res.concat(tokens.slice(i + 1))
      }
    } else {
      res.push(tokens[i])
    }
  }
  return res
}

function wrapToken(tok) {
  return '^' + tok + '$'
}

function filterOnAlphabet(alphabet) {
  if (alphabet && alphabet.length > 0) {
    var matcher = new RegExp(alphabet.map(wrapToken).join('|'))
  }

  return function checkToken(token) {
    if (matcher === undefined) {
      return true
    }
    return matcher.test(token)
  }
}

function getDiffer(splitter, alphabet) {
  if (splitter === undefined) {
    splitter = ''
  }

  var filterFunction = filterOnAlphabet(alphabet)

  return function diff(first, second) {
    var firstTokens = first.split(splitter).filter(filterFunction)
    var secondTokens = second.split(splitter).filter(filterFunction)
    var lcs = longestCommonSubsequence(firstTokens, secondTokens)

    if (lcs.sequences.length === 0) {
      return [first, second]
    }

    var sequence = lcs.sequences[0]

    return [getDiff(firstTokens, sequence),
            getDiff(secondTokens, sequence)]
  }
}
