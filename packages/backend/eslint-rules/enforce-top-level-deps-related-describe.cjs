const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforces that container-dependant custom describe functions are used only at the top level of test suites.',
      recommended: true,
    },
    hasSuggestions: true,
    messages: {
      useAtTopLevelOnly:
        '"{{ functionName }}" must be used at the top level of test suites.',
      noDuplicate:
        'Container-dependant custom describe functions cannot be used multiple times in the same file.',
      noMixing:
        'Cannot mix "describeWithDeps" and "describeWithoutDeps" in the same file.',
    },
  },
  create: function (context) {
    let describeDepth = 0;
    let usedContainerDependantDescribe = null; // 다음의 셋 중 하나의 값을 설정('with' | 'without' | null)

    function isContainerDependantDescribe(name) {
      return name === 'describeWithDeps' || name === 'describeWithoutDeps';
    }

    function checkContainerDependantDescribeUsage(node, describeName) {
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
        describeName === 'describeWithDeps' ? 'with' : 'without';

      if (usedContainerDependantDescribe === null) {
        usedContainerDependantDescribe = currentType;
      } else {
        context.report({
          node,
          messageId:
            usedContainerDependantDescribe === currentType
              ? 'noDuplicate'
              : 'noMixing',
        });
      }
    }

    return {
      'CallExpression[callee.name="describe"]'() {
        describeDepth++;
      },

      [`CallExpression[callee.name="describeWithDeps"], CallExpression[callee.name="describeWithoutDeps"]`](
        node,
      ) {
        const describeName = node.callee.name;
        checkContainerDependantDescribeUsage(node, describeName);
      },

      'CallExpression:exit'(node) {
        if (
          node.callee.type === 'Identifier' &&
          (node.callee.name === 'describe' ||
            isContainerDependantDescribe(node.callee.name))
        ) {
          describeDepth--;
        }
      },
    };
  },
};

module.exports = rule;
