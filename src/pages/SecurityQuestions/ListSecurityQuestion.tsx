// src/pages/SecurityQuestionList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecurityQuestion } from '../../models/SecurityQuestion';
import { securityQuestionService } from '../../services/securityQuestionService';
import GenericTable from '../../components/GenericTable';
import Swal from 'sweetalert2';
import GenericButton from '../../components/GenericButton';

const SecurityQuestionList: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await securityQuestionService.getAll();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAction = async (action: string, item: SecurityQuestion) => {
    if (action === 'view') {
      navigate(`/security-questions/${item.id}`);
    } else if (action === 'edit') {
      navigate(`/security-questions/update/${item.id}`);
    } else if (action === 'delete') {
      Swal.fire({
        title: 'Delete',
        text: 'Are you sure you want to delete this question?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await securityQuestionService.delete(item.id!);
          Swal.fire('Deleted!', 'The question has been deleted.', 'success');
          fetchQuestions();
        }
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Security Questions
        </h2>

        <GenericButton
          label="+ Add Question"
          onClick={() => navigate(`/security-questions/create`)}
          variant="success"
        />
      </div>

      <GenericTable
        data={questions}
        columns={['id', 'name', 'description']}
        actions={[
          { name: 'view', label: 'View', variant: 'info' },
          { name: 'edit', label: 'Edit', variant: 'primary' },
          { name: 'delete', label: 'Delete', variant: 'danger' },
        ]}
        onAction={handleAction}
      />
    </div>
  );
};

export default SecurityQuestionList;
