# -*- coding: utf-8 -*-
"""
  con_theta_inf.py generated by WhatsOpt. 
"""
from con_theta_inf_base import ConThetaInfBase

class ConThetaInf(ConThetaInfBase):
    """ An OpenMDAO component to encapsulate ConThetaInf discipline """

    def __init__(self, scalers):
    	super(ConThetaInf, self).__init__()
        self.scalers=scalers
		
    def compute(self, inputs, outputs):
        """ ConThetaInf computation """
    
        outputs['con_Theta_low'] = 0.96-inputs['Theta']*self.scalers['Theta']


	
# To declare partial derivatives computation ...
# 
#    def setup()
#        super(ConThetaInf, self).setup()
#        declare_partials('*', '*')  
			
#    def compute_partials(self, inputs, partials):
#        """ Jacobian for ConThetaInf """
    
   		
#       	partials['con_Theta_low', 'Theta'] = np.zeros((1, 1))        