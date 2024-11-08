const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforces that database-related custom describe functions are used only at the top level of test suites.',
      recommended: true,
    },
    hasSuggestions: true,
    messages: {
      useAtTopLevelOnly:
        '"{{ functionName }}" must be used at the top level of test suites.',
      noDuplicate:
        'Database-related custom describe functions cannot be used multiple times in the same file.',
      noMixing:
        'Cannot mix "describeWithDB" and "describeWithoutDB" in the same file.',
    },
  },
  create: function (context) {
    let describeDepth = 0;
    let usedDatabaseRelatedDescribe = null; // 다음의 셋 중 하나의 값을 설정('with' | 'without' | null)

    function isDatabaseRelatedDescribe(name) {
      return name === 'describeWithDB' || name === 'describeWithoutDB';
    }

    function checkDatabaseRelatedDescribeUsage(node, describeName) {
      // 최상위 레벨 이외에 사용 시 에러
      if (describeDepth > 0) {
        context.report({
          node,
          messageId: 'useAtTopLevelOnly',
          data: {
            functionName: describeName,
          },
          suggest: [
            {
              desc: 'Replace with "describe"',
              fix(fixer) {
                return fixer.replaceText(node.callee, 'describe');
              },
            },
          ],
        });
      }

      // 이미 다른 커스텀 describe가 사용된 경우 체크
      const currentType =
        describeName === 'describeWithDB' ? 'with' : 'without';

      if (usedDatabaseRelatedDescribe === null) {
        usedDatabaseRelatedDescribe = currentType;
      } else {
        context.report({
          node,
          messageId:
            usedDatabaseRelatedDescribe === currentType
              ? 'noDuplicate'
              : 'noMixing',
        });
      }
    }

    return {
      'CallExpression[callee.name="describe"]'() {
        describeDepth++;
      },

      [`CallExpression[callee.name="describeWithDB"], CallExpression[callee.name="describeWithoutDB"]`](
        node,
      ) {
        const describeName = node.callee.name;
        checkDatabaseRelatedDescribeUsage(node, describeName);
      },

      'CallExpression:exit'(node) {
        if (
          node.callee.type === 'Identifier' &&
          (node.callee.name === 'describe' ||
            isDatabaseRelatedDescribe(node.callee.name))
        ) {
          describeDepth--;
        }
      },
    };
  },
};

module.exports = rule;
