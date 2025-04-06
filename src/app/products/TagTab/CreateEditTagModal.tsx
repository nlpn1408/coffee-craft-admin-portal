import React from 'react';
import { Modal } from 'antd';
import { Tag, NewTag } from '@/types';
import { TagForm } from './TagForm';

interface CreateEditTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewTag) => void;
  initialData?: Tag;
  isLoading?: boolean;
}

const CreateEditTagModal: React.FC<CreateEditTagModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const modalTitle = initialData ? 'Edit Tag' : 'Create New Tag';

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={onClose}
      footer={null} // Footer is handled by the form's buttons
      destroyOnClose // Reset form state when closed
      maskClosable={false}
    >
      <TagForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onClose} // Pass cancel handler to form
        isLoading={isLoading}
      />
    </Modal>
  );
};

export default CreateEditTagModal;