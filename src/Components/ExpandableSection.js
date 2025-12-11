import React, { useState } from 'react';

const ExpandableSection = ({ items, renderItem, limit = 3, className = "", mode = "div" }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!items || items.length === 0) {
        return null;
    }

    // Render ALL items, but mark hidden ones with a class
    const renderedItems = items.map((item, index) => {
        const element = renderItem(item, index);
        const isVisible = isExpanded || index < limit;

        if (isVisible) {
            return element;
        }

        // Add hide-on-screen class to hidden items
        const existingClass = element.props.className || "";
        return React.cloneElement(element, {
            className: `${existingClass} hide-on-screen`.trim()
        });
    });

    const ExpandButton = () => (
        items.length > limit ? (
            <div className="expand-button-container" style={{ textAlign: 'center', marginTop: '20px', width: '100%', clear: 'both' }}>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="expand-btn"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#11ABB0',
                        fontSize: '24px',
                        outline: 'none'
                    }}
                    title={isExpanded ? "Show Less" : "Show More"}
                >
                    <i className={`fa ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
            </div>
        ) : null
    );

    if (mode === 'list') {
        return (
            <div className="expandable-list-wrapper">
                <ul className={className}>
                    {renderedItems}
                </ul>
                <ExpandButton />
            </div>
        );
    }

    return (
        <div className={`expandable-section ${className}`}>
            {renderedItems}
            <ExpandButton />
        </div>
    );
};

export default ExpandableSection;
