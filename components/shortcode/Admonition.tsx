import React from 'react';
import PropTypes from 'prop-types';

import markdown from 'remark-parse';
import html from 'remark-html';
import { unified } from 'unified';

function renderTitle(title: string) {
  const result = unified().use(markdown).use(html).processSync(title);
  return result.toString();
}

type InfoType = 'info' | 'note';
type WarningType = 'warning' | 'important';
type ErrorType = 'error' | 'danger' | 'caution';
type QuestionType = 'question';
type SuccessType = 'tip' | 'success';
export type AdmonitionType = InfoType | WarningType | ErrorType | QuestionType | SuccessType;

export interface AdmonitionProps {
  type?: AdmonitionType;
  title?: string;
}

const emojisMap = {
  warning: '⚠️',
  caution: '🔥',
  tip: '💡',
  note: 'ℹ️',
  question: '?',
};

const colorMap = {
  warning: 'bg-yellow-700 border-yellow-600 text-white',
  caution: 'bg-red-700 border-red-600 text-white',
  tip: 'bg-green-700 border-green-600 text-white',
  note: 'bg-blue-700 border-blue-600 text-white',
  question: 'bg-blue-700 border-blue-600 text-white',
};

function remapType(type: AdmonitionType): AdmonitionType {
  if (typeof type !== 'string') {
    return 'tip';
  }
  if (['info', 'note'].includes(type)) {
    return 'note';
  }
  if (['warning', 'important'].includes(type)) {
    return 'warning';
  }
  if (['error', 'danger', 'caution'].includes(type)) {
    return 'caution';
  }
  if (['tip', 'success'].includes(type)) {
    return 'tip';
  }
  if (type === 'question') {
    return type;
  }
  return 'tip';
}

export default class Admonition extends React.Component<AdmonitionProps> {
  static propTypes = {
    type: PropTypes.string,
    title: PropTypes.string,
  };

  render() {
    const { type, title } = this.props;

    const realType = remapType(type);
    const colorDiv = colorMap[realType];
    const iconData = emojisMap[realType];

    return (
      <div
        className={`${colorDiv} border-l-4 px-3 py-0 my-5 mx-0 overflow-x-hidden relative rounded-md flex flex-col bg-opacity-20`}
      >
        <div
          className="flex flex-row justify-between px-7 py-1 my-0 -ml-8 -mr-6 bg-opacity-80"
          style={{
            backgroundColor: 'inherit',
          }}
        >
          <div className="flex flex-row float-left items-center font-semibold gap-1">
            <div className="flex">{iconData}</div>
            <div
              className={`flex admonition-title mt-0.5 ${
                typeof title !== 'string' ? 'uppercase' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: renderTitle(title || realType) }}
            />
          </div>
          {/* <div className="flex float-right text-sm items-center text-gray-400 font-semibold transform rotate-90">
            {'>'}
          </div> */}
        </div>
        <div className="overflow-y-hidden transition-all duration-700 max-h-[12000px]">
          <div className="px-0 py-2 admonition-content inline-block gap-2">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
